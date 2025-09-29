#!/usr/bin/env node

/**
 * Script de correction automatique des erreurs TypeScript
 * À exécuter depuis le répertoire backend
 */

import fs from 'fs';
import path from 'path';

interface FixRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// Règles de correction automatique
const COMMON_FIXES: FixRule[] = [
  {
    pattern: /import\s+{\s*UserRole\s*}\s+from\s+['"]@prisma\/client['"];?/g,
    replacement: '// UserRole removed - using string literals instead',
    description: 'Remove non-existent UserRole import'
  },
  {
    pattern: /:\s*UserRole\b/g,
    replacement: ': "SUPER_ADMIN" | "ADMIN" | "USER"',
    description: 'Replace UserRole type with string literal union'
  },
  {
    pattern: /(\w+)\s*as\s+string\s*\|\|\s*(\w+)\s*as\s+string/g,
    replacement: '($1 || $2) as string',
    description: 'Clean up redundant string casting'
  },
  {
    pattern: /new Date\((\w+) as string\)/g,
    replacement: '$1 ? new Date($1 as string) : undefined',
    description: 'Safe date parsing with undefined check'
  },
  {
    pattern: /include:\s*{\s*orderItems:\s*true\s*}/g,
    replacement: 'include: {\n    items: true\n  }',
    description: 'Fix orderItems to items relation'
  },
  {
    pattern: /const\s+(\w+)\s*=\s*(\w+)\s*as\s+(\w+)\s*\|\|\s*undefined;/g,
    replacement: 'const $1: $3 | undefined = $2 ? $2 as $3 : undefined;',
    description: 'Proper optional type handling'
  }
];

// Corrections spécifiques par fichier
const FILE_SPECIFIC_FIXES = {
  'adminController.ts': [
    {
      pattern: /const filters = {[\s\S]*?};/g,
      replacement: `const filters: any = {
  status: status as string,
  customerId: customerId as string,
};

if (dateFrom) {
  filters.dateFrom = new Date(dateFrom as string);
}
if (dateTo) {
  filters.dateTo = new Date(dateTo as string);
}`,
      description: 'Fix date filters with proper undefined handling'
    }
  ],
  'authController.ts': [
    {
      pattern: /role:\s*UserRole\./g,
      replacement: 'role: "',
      description: 'Replace UserRole enum with string'
    }
  ],
  'paymentController.ts': [
    {
      pattern: /Payment\s*\[\]/g,
      replacement: 'any[]',
      description: 'Temporary fix for Payment type'
    }
  ]
};

class TypeScriptFixer {
  private fixedFiles: string[] = [];
  private errors: string[] = [];

  async fixDirectory(dirPath: string): Promise<void> {
    const files = this.getTypeScriptFiles(dirPath);
    
    console.log(`🔧 Found ${files.length} TypeScript files to check...`);
    
    for (const file of files) {
      try {
        await this.fixFile(file);
      } catch (error) {
        this.errors.push(`Error fixing ${file}: ${error.message}`);
      }
    }
    
    this.printSummary();
  }

  private getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    const traverse = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !['node_modules', 'dist', '.git'].includes(item)) {
          traverse(fullPath);
        } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    };
    
    traverse(dir);
    return files;
  }

  private async fixFile(filePath: string): Promise<void> {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;
    let changes = 0;
    
    const fileName = path.basename(filePath);
    console.log(`\n📝 Processing: ${fileName}`);
    
    // Apply common fixes
    for (const fix of COMMON_FIXES) {
      const matches = content.match(fix.pattern);
      if (matches) {
        content = content.replace(fix.pattern, fix.replacement);
        changes += matches.length;
        console.log(`  ✅ ${fix.description} (${matches.length} fixes)`);
      }
    }
    
    // Apply file-specific fixes
    if (FILE_SPECIFIC_FIXES[fileName]) {
      for (const fix of FILE_SPECIFIC_FIXES[fileName]) {
        const matches = content.match(fix.pattern);
        if (matches) {
          content = content.replace(fix.pattern, fix.replacement);
          changes += matches.length;
          console.log(`  ✅ ${fix.description} (${matches.length} fixes)`);
        }
      }
    }
    
    // Save if changes were made
    if (content !== originalContent) {
      // Create backup
      fs.writeFileSync(filePath + '.backup', originalContent);
      fs.writeFileSync(filePath, content);
      
      this.fixedFiles.push(fileName);
      console.log(`  💾 Saved with ${changes} changes (backup created)`);
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 CORRECTION SUMMARY');
    console.log('='.repeat(50));
    
    if (this.fixedFiles.length > 0) {
      console.log(`✅ Files fixed: ${this.fixedFiles.length}`);
      this.fixedFiles.forEach(file => console.log(`   - ${file}`));
    } else {
      console.log('ℹ️  No files needed fixing');
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n🔄 Next steps:');
    console.log('1. Run: npm run type-check');
    console.log('2. Test the application');
    console.log('3. If issues, restore from .backup files');
    console.log('4. Continue with manual fixes for remaining errors');
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new TypeScriptFixer();
  const srcPath = process.argv[2] || './src';
  
  console.log('🚀 Starting TypeScript auto-correction...');
  console.log(`📁 Target directory: ${srcPath}\n`);
  
  fixer.fixDirectory(srcPath)
    .then(() => console.log('\n✨ Auto-correction completed!'))
    .catch(error => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}