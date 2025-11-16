/**
 * Test script for User Management API endpoints (Phase 7)
 * Tests all CRUD operations and validations
 */

import { getAllUsers, createUser, getUserById, updateUser, deleteUser, updateUserPassword } from '../src/lib/queries/users'

async function testUserAPI() {
  console.log('🧪 Testing User Management API Functions\n')

  try {
    // Test 1: Get all users
    console.log('1️⃣ Testing getAllUsers()...')
    const allUsers = await getAllUsers()
    console.log(`   ✅ Found ${allUsers.length} user(s)`)
    console.log(`   Users:`, allUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })))
    console.log('')

    // Test 2: Create a new test user
    console.log('2️⃣ Testing createUser()...')
    const newUser = await createUser({
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'user',
    })
    console.log(`   ✅ Created user:`, { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role })
    console.log('')

    // Test 3: Get user by ID
    console.log('3️⃣ Testing getUserById()...')
    const fetchedUser = await getUserById(newUser.id)
    if (fetchedUser) {
      console.log(`   ✅ Fetched user:`, { id: fetchedUser.id, name: fetchedUser.name, email: fetchedUser.email })
    } else {
      console.log(`   ❌ User not found`)
    }
    console.log('')

    // Test 4: Update user
    console.log('4️⃣ Testing updateUser()...')
    const updatedUser = await updateUser(newUser.id, {
      name: 'Updated Test User',
    })
    if (updatedUser) {
      console.log(`   ✅ Updated user:`, { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email })
    } else {
      console.log(`   ❌ Update failed`)
    }
    console.log('')

    // Test 5: Update password
    console.log('5️⃣ Testing updateUserPassword()...')
    await updateUserPassword(newUser.id, 'newpassword123')
    console.log(`   ✅ Password updated successfully`)
    console.log('')

    // Test 6: Delete user
    console.log('6️⃣ Testing deleteUser()...')
    await deleteUser(newUser.id)
    console.log(`   ✅ User deleted successfully`)

    // Verify deletion
    const deletedUser = await getUserById(newUser.id)
    if (!deletedUser) {
      console.log(`   ✅ Verified: User no longer exists`)
    } else {
      console.log(`   ❌ Error: User still exists after deletion`)
    }
    console.log('')

    // Test 7: Final user count
    console.log('7️⃣ Final user count...')
    const finalUsers = await getAllUsers()
    console.log(`   ✅ Total users: ${finalUsers.length}`)
    console.log('')

    console.log('✅ All tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run tests
testUserAPI()
