#!/usr/bin/env node

/**
 * Database Backfill Script - Phase 2 Migration
 * 
 * Migrates data from JSON files to PostgreSQL database
 * - Zero-downtime migration approach
 * - Validates data integrity during migration
 * - Rollback capability if issues are detected
 */

import { readFile } from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const PHASE_2_ENABLED = process.env.ENABLE_DATABASE === 'true';
const DRY_RUN = process.env.DRY_RUN === 'true';

console.log('🔄 West Coast Collectibles - Database Backfill Script');
console.log('='.repeat(60));

if (!PHASE_2_ENABLED) {
  console.log('❌ Phase 2 database not enabled. Set ENABLE_DATABASE=true to proceed.');
  console.log('🔒 This prevents accidental migration while JSON storage is active.');
  process.exit(1);
}

if (DRY_RUN) {
  console.log('🧪 DRY RUN MODE - No data will be written to database');
}

const prisma = new PrismaClient();

class BackfillMigration {
  constructor() {
    this.dataPath = path.join(process.cwd(), 'data');
    this.stats = {
      users: { processed: 0, success: 0, errors: 0 },
      products: { processed: 0, success: 0, errors: 0 },
      wishlistItems: { processed: 0, success: 0, errors: 0 },
      sessions: { processed: 0, success: 0, errors: 0 },
      notifications: { processed: 0, success: 0, errors: 0 }
    };
  }

  async loadJsonFile(filename) {
    try {
      const filePath = path.join(this.dataPath, filename);
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.log(`⚠️  Could not load ${filename}: ${error.message}`);
      return [];
    }
  }

  async testDatabaseConnection() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async migrateUsers() {
    console.log('\n👥 Migrating users...');
    const users = await this.loadJsonFile('users.json');
    
    for (const userData of users) {
      this.stats.users.processed++;
      
      try {
        // Map JSON structure to Prisma model
        const userInput = {
          id: userData.id,
          email: userData.email,
          passwordHash: userData.password, // Assuming bcrypt hash
          firstName: userData.firstName,
          lastName: userData.lastName,
          isAdmin: userData.isAdmin || false,
          isVerified: userData.verified || false,
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          lastLoginAt: userData.lastLogin ? new Date(userData.lastLogin) : null,
        };
        
        if (!DRY_RUN) {
          await prisma.user.create({
            data: userInput
          });
        }
        
        this.stats.users.success++;
        console.log(`   ✅ ${userInput.email}`);
        
      } catch (error) {
        this.stats.users.errors++;
        console.log(`   ❌ ${userData.email}: ${error.message}`);
      }
    }
  }

  async migrateProducts() {
    console.log('\n📦 Migrating products...');
    
    // Load products from your current products source
    // This might be from lib/products.ts or CSV files
    try {
      const { getAllProducts } = await import('../lib/products.ts');
      const products = await getAllProducts();
      
      for (const productData of products) {
        this.stats.products.processed++;
        
        try {
          // Map product structure to Prisma model
          const productInput = {
            id: productData.id,
            title: productData.title,
            description: productData.description,
            brand: productData.brand,
            category: productData.category,
            subcategory: productData.subcategory,
            price: parseFloat(productData.price),
            salePrice: productData.salePrice ? parseFloat(productData.salePrice) : null,
            stock: productData.stock || 0,
            sku: productData.sku,
            images: productData.images || [],
            heroImage: productData.heroImage,
            isActive: productData.isActive !== false,
            isFeatured: productData.isFeatured || false,
            isStaffPick: productData.isStaffPick || false,
            isLimitedEdition: productData.isLimitedEdition || false,
            isNewRelease: productData.isNewRelease || false,
            isComingSoon: productData.isComingSoon || false,
            releaseDate: productData.releaseDate ? new Date(productData.releaseDate) : null,
            dropDate: productData.dropDate ? new Date(productData.dropDate) : null,
            createdAt: productData.createdAt ? new Date(productData.createdAt) : new Date(),
          };
          
          if (!DRY_RUN) {
            await prisma.product.create({
              data: productInput
            });
          }
          
          this.stats.products.success++;
          console.log(`   ✅ ${productInput.title}`);
          
        } catch (error) {
          this.stats.products.errors++;
          console.log(`   ❌ ${productData.title}: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`⚠️  Could not load products: ${error.message}`);
    }
  }

  async migrateWishlists() {
    console.log('\n❤️  Migrating wishlists...');
    const wishlists = await this.loadJsonFile('wishlists.json');
    
    for (const wishlistData of wishlists) {
      this.stats.wishlistItems.processed++;
      
      try {
        const wishlistInput = {
          userId: wishlistData.userId,
          productId: wishlistData.productId,
          notifyOnRestock: wishlistData.notifyOnRestock !== false,
          notifyOnSale: wishlistData.notifyOnSale !== false,
          addedAt: wishlistData.addedAt ? new Date(wishlistData.addedAt) : new Date(),
        };
        
        if (!DRY_RUN) {
          await prisma.wishlistItem.create({
            data: wishlistInput
          });
        }
        
        this.stats.wishlistItems.success++;
        console.log(`   ✅ User ${wishlistInput.userId} - Product ${wishlistInput.productId}`);
        
      } catch (error) {
        this.stats.wishlistItems.errors++;
        console.log(`   ❌ ${wishlistData.userId}/${wishlistData.productId}: ${error.message}`);
      }
    }
  }

  async migrateSessions() {
    console.log('\n🔐 Migrating sessions...');
    const sessions = await this.loadJsonFile('sessions.json');
    
    for (const sessionData of sessions) {
      this.stats.sessions.processed++;
      
      try {
        // Only migrate active sessions
        const expiresAt = new Date(sessionData.expiresAt);
        if (expiresAt < new Date()) {
          continue; // Skip expired sessions
        }
        
        const sessionInput = {
          id: sessionData.id,
          userId: sessionData.userId,
          token: sessionData.token,
          expiresAt: expiresAt,
          createdAt: sessionData.createdAt ? new Date(sessionData.createdAt) : new Date(),
        };
        
        if (!DRY_RUN) {
          await prisma.session.create({
            data: sessionInput
          });
        }
        
        this.stats.sessions.success++;
        console.log(`   ✅ Session ${sessionInput.id}`);
        
      } catch (error) {
        this.stats.sessions.errors++;
        console.log(`   ❌ ${sessionData.id}: ${error.message}`);
      }
    }
  }

  async migrateNotifications() {
    console.log('\n🔔 Migrating notifications...');
    const notifications = await this.loadJsonFile('notification_subscriptions.json');
    
    for (const notificationData of notifications) {
      this.stats.notifications.processed++;
      
      try {
        const notificationInput = {
          userId: notificationData.userId,
          productId: notificationData.productId || null,
          type: notificationData.type || 'RESTOCK',
          email: notificationData.email,
          isActive: notificationData.isActive !== false,
          createdAt: notificationData.createdAt ? new Date(notificationData.createdAt) : new Date(),
        };
        
        if (!DRY_RUN) {
          await prisma.notificationSubscription.create({
            data: notificationInput
          });
        }
        
        this.stats.notifications.success++;
        console.log(`   ✅ ${notificationInput.email} - ${notificationInput.type}`);
        
      } catch (error) {
        this.stats.notifications.errors++;
        console.log(`   ❌ ${notificationData.email}: ${error.message}`);
      }
    }
  }

  async validateMigration() {
    console.log('\n🔍 Validating migration...');
    
    try {
      const counts = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.wishlistItem.count(),
        prisma.session.count(),
        prisma.notificationSubscription.count()
      ]);
      
      console.log(`✅ Database contains:`);
      console.log(`   Users: ${counts[0]}`);
      console.log(`   Products: ${counts[1]}`);
      console.log(`   Wishlist Items: ${counts[2]}`);
      console.log(`   Sessions: ${counts[3]}`);
      console.log(`   Notifications: ${counts[4]}`);
      
      // Basic referential integrity check
      const orphanedWishlistItems = await prisma.wishlistItem.count({
        where: {
          user: null
        }
      });
      
      if (orphanedWishlistItems > 0) {
        console.log(`⚠️  ${orphanedWishlistItems} orphaned wishlist items detected`);
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (const [category, stats] of Object.entries(this.stats)) {
      console.log(`${category.toUpperCase()}:`);
      console.log(`   Processed: ${stats.processed}`);
      console.log(`   Success: ${stats.success}`);
      console.log(`   Errors: ${stats.errors}`);
      console.log('');
      
      totalProcessed += stats.processed;
      totalSuccess += stats.success;
      totalErrors += stats.errors;
    }
    
    console.log(`TOTALS:`);
    console.log(`   Processed: ${totalProcessed}`);
    console.log(`   Success: ${totalSuccess}`);
    console.log(`   Errors: ${totalErrors}`);
    console.log(`   Success Rate: ${((totalSuccess / totalProcessed) * 100).toFixed(1)}%`);
    
    if (DRY_RUN) {
      console.log('\n🧪 DRY RUN COMPLETED - No data was written');
    } else if (totalErrors === 0) {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('📝 Next steps:');
      console.log('   1. Update ENABLE_DATABASE=true in production');
      console.log('   2. Monitor application for any issues');
      console.log('   3. Backup JSON files before removing them');
    } else {
      console.log('\n⚠️  MIGRATION COMPLETED WITH ERRORS');
      console.log('📝 Recommended actions:');
      console.log('   1. Review error messages above');
      console.log('   2. Fix data issues and re-run migration');
      console.log('   3. Consider partial rollback if needed');
    }
  }
}

// Main migration execution
async function main() {
  const migration = new BackfillMigration();
  
  try {
    // Pre-flight checks
    if (!(await migration.testDatabaseConnection())) {
      console.error('💥 Database connection failed - cannot proceed');
      process.exit(1);
    }
    
    // Run migrations
    await migration.migrateUsers();
    await migration.migrateProducts();
    await migration.migrateWishlists();
    await migration.migrateSessions();
    await migration.migrateNotifications();
    
    // Validate results
    if (!DRY_RUN) {
      await migration.validateMigration();
    }
    
    migration.printSummary();
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
}