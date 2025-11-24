-- =====================================================
-- Secure Order Creation Transaction
-- =====================================================
-- This function handles the entire order creation process atomically:
-- 1. Verifies stock and prices from the DB (preventing manipulation).
-- 2. Deducts stock (preventing race conditions).
-- 3. Creates the order and order items.
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_order_transaction(
    p_user_id UUID,
    p_items JSONB,           -- Array of { product_id, quantity }
    p_shipping_address JSONB, -- { street, city, postalCode, country }
    p_customer_info JSONB,    -- { firstName, lastName, email, phone }
    p_payment_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (admin) to ensure access to tables
AS $$
DECLARE
    v_customer_id UUID;
    v_address_id UUID;
    v_order_id UUID;
    v_total_amount DECIMAL(12, 2) := 0;
    v_subtotal DECIMAL(12, 2) := 0;
    v_shipping_amount DECIMAL(12, 2) := 0; -- Can be calculated based on rules later
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_product_price DECIMAL(10, 2);
    v_product_stock INTEGER;
    v_product_name TEXT;
    v_order_number TEXT;
BEGIN
    -- 1. Get or Create Customer
    -- Try to find existing customer for user
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE user_id = p_user_id;

    -- If not found, create new customer (or handle guest if p_user_id is null, but we assume auth for now)
    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (user_id, first_name, last_name, email, phone)
        VALUES (
            p_user_id,
            p_customer_info->>'firstName',
            p_customer_info->>'lastName',
            p_customer_info->>'email',
            p_customer_info->>'phone'
        )
        RETURNING id INTO v_customer_id;
    END IF;

    -- 2. Create Shipping Address
    INSERT INTO public.addresses (customer_id, type, street, city, postal_code, country)
    VALUES (
        v_customer_id,
        'SHIPPING',
        p_shipping_address->>'street',
        p_shipping_address->>'city',
        p_shipping_address->>'postalCode',
        COALESCE(p_shipping_address->>'country', 'Algeria')
    )
    RETURNING id INTO v_address_id;

    -- 3. Calculate Totals and Deduct Stock (The Critical Part)
    -- We iterate through items first to calculate total and lock rows
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'productId')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;

        -- Lock the product row for update to prevent race conditions
        SELECT price, stock_quantity, name INTO v_product_price, v_product_stock, v_product_name
        FROM public.products
        WHERE id = v_product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % not found', v_product_id;
        END IF;

        -- Check stock
        IF v_product_stock < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product: % (Requested: %, Available: %)', v_product_name, v_quantity, v_product_stock;
        END IF;

        -- Deduct stock
        UPDATE public.products
        SET stock_quantity = stock_quantity - v_quantity
        WHERE id = v_product_id;

        -- Accumulate totals (using DB price, ignoring client price)
        v_subtotal := v_subtotal + (v_product_price * v_quantity);
    END LOOP;

    -- Calculate final total (add shipping, tax, etc. here if needed)
    -- For now, we assume free shipping or fixed shipping, let's say 0 for simplicity or pass it securely
    -- Ideally shipping rules should be server-side too.
    v_total_amount := v_subtotal + v_shipping_amount;

    -- 4. Create Order
    v_order_number := 'ORD-' || floor(extract(epoch from now())) || '-' || floor(random() * 1000);

    INSERT INTO public.orders (
        order_number,
        customer_id,
        address_id,
        status,
        payment_status,
        subtotal,
        shipping_amount,
        total_amount,
        tax_amount,
        discount_amount
    )
    VALUES (
        v_order_number,
        v_customer_id,
        v_address_id,
        'pending',
        'pending', -- Default to pending/COD
        v_subtotal,
        v_shipping_amount,
        v_total_amount,
        0, -- Tax
        0  -- Discount
    )
    RETURNING id INTO v_order_id;

    -- 5. Create Order Items (Second pass, or could have done in first loop if we had order_id)
    -- Since we need order_id, we do it now. We already deducted stock.
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'productId')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;
        
        -- Re-fetch price just to be safe/consistent, or use variable if we stored it (but we looped)
        SELECT price INTO v_product_price FROM public.products WHERE id = v_product_id;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price
        )
        VALUES (
            v_order_id,
            v_product_id,
            v_quantity,
            v_product_price,
            v_product_price * v_quantity
        );
    END LOOP;

    -- 6. Create Payment Record (Pending)
    INSERT INTO public.payments (
        order_id,
        method,
        provider,
        amount,
        status
    )
    VALUES (
        v_order_id,
        p_payment_method,
        'MANUAL',
        v_total_amount,
        'pending'
    );

    -- Return the created order ID
    RETURN jsonb_build_object('id', v_order_id, 'orderNumber', v_order_number, 'total', v_total_amount);
END;
$$;
