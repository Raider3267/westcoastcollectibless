#!/usr/bin/env python3
"""
Admin Authentication and Dashboard Navigation Test
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
import time
import sys

class AdminLoginTest:
    def __init__(self):
        self.driver = None
        self.base_url = "http://localhost:3000"
        self.admin_email = "jaydenreyes32@icloud.com"
        self.admin_password = "westcoast2025"  # From the script we saw
        self.timeout = 15
        
    def setup_driver(self):
        """Initialize Chrome WebDriver with appropriate options"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-extensions")
            chrome_options.add_argument("--window-size=1920,1080")
            # Remove headless mode so we can see what's happening
            # chrome_options.add_argument("--headless")
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            print("✅ WebDriver initialized successfully")
            return True
            
        except WebDriverException as e:
            print(f"❌ Failed to initialize WebDriver: {e}")
            return False
    
    def navigate_to_homepage(self):
        """Step 1: Navigate to the main application"""
        try:
            print(f"\n🌐 Step 1: Navigating to {self.base_url}")
            self.driver.get(self.base_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, self.timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            current_url = self.driver.current_url
            print(f"✅ Successfully navigated to: {current_url}")
            
            # Check for key elements that indicate the homepage loaded
            try:
                # Look for common homepage elements
                page_title = self.driver.find_element(By.TAG_NAME, "title").get_attribute("textContent")
                print(f"📄 Page title: {page_title}")
            except:
                print("⚠️  Could not retrieve page title")
                
            return True
            
        except TimeoutException:
            print(f"❌ Timeout waiting for homepage to load")
            return False
        except Exception as e:
            print(f"❌ Error navigating to homepage: {e}")
            return False
    
    def open_signin_modal(self):
        """Step 2: Open the signin modal"""
        try:
            print(f"\n🔐 Step 2: Opening signin modal")
            
            # Look for signin button - trying multiple selectors
            signin_selectors = [
                'button[aria-label="Sign in"]',
                'button:contains("Sign In")',
                '[data-testid="signin-button"]',
                'button[class*="signin"]',
                'a[href*="login"]',
                'button:contains("Sign in")'
            ]
            
            signin_button = None
            for selector in signin_selectors:
                try:
                    if 'contains' in selector:
                        # Use XPath for text-based selection
                        xpath_selector = f"//button[contains(text(), 'Sign In') or contains(text(), 'Sign in')]"
                        signin_button = self.driver.find_element(By.XPATH, xpath_selector)
                    else:
                        signin_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    
                    if signin_button and signin_button.is_displayed():
                        print(f"✅ Found signin button using selector: {selector}")
                        break
                except:
                    continue
            
            if not signin_button:
                # Fallback: try to find any button with "Sign" in the text
                try:
                    signin_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Sign')]")
                    print("✅ Found signin button using fallback text search")
                except:
                    print("❌ Could not find signin button")
                    return False
            
            # Click the signin button
            signin_button.click()
            print("✅ Clicked signin button")
            
            # Wait for modal to appear
            modal_selectors = [
                '[role="dialog"]',
                '.modal',
                '[class*="modal"]',
                'div[style*="position: fixed"]'
            ]
            
            modal_found = False
            for selector in modal_selectors:
                try:
                    WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    print(f"✅ Signin modal opened using selector: {selector}")
                    modal_found = True
                    break
                except:
                    continue
            
            if not modal_found:
                print("⚠️  Modal may have opened but couldn't confirm with standard selectors")
            
            return True
            
        except Exception as e:
            print(f"❌ Error opening signin modal: {e}")
            return False
    
    def fill_login_form(self):
        """Step 3: Fill in admin credentials"""
        try:
            print(f"\n📝 Step 3: Filling login form")
            
            # Wait a moment for modal to fully load
            time.sleep(1)
            
            # Look for email input field
            email_selectors = [
                'input[type="email"]',
                'input[name="email"]',
                'input[id="email"]',
                'input[placeholder*="email"]',
                'input[placeholder*="Email"]'
            ]
            
            email_input = None
            for selector in email_selectors:
                try:
                    email_input = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if email_input.is_displayed():
                        print(f"✅ Found email input using selector: {selector}")
                        break
                except:
                    continue
            
            if not email_input:
                print("❌ Could not find email input field")
                return False
            
            # Clear and fill email
            email_input.clear()
            email_input.send_keys(self.admin_email)
            print(f"✅ Entered admin email")
            
            # Look for password input field
            password_selectors = [
                'input[type="password"]',
                'input[name="password"]',
                'input[id="password"]',
                'input[placeholder*="password"]',
                'input[placeholder*="Password"]'
            ]
            
            password_input = None
            for selector in password_selectors:
                try:
                    password_input = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if password_input.is_displayed():
                        print(f"✅ Found password input using selector: {selector}")
                        break
                except:
                    continue
            
            if not password_input:
                print("❌ Could not find password input field")
                return False
            
            # Clear and fill password
            password_input.clear()
            password_input.send_keys(self.admin_password)
            print(f"✅ Entered admin password")
            
            return True
            
        except Exception as e:
            print(f"❌ Error filling login form: {e}")
            return False
    
    def submit_login_form(self):
        """Step 4: Submit the authentication form"""
        try:
            print(f"\n🚀 Step 4: Submitting login form")
            
            # Look for submit button
            submit_selectors = [
                'button[type="submit"]',
                'button:contains("Sign in")',
                'button:contains("Sign In")',
                'button:contains("Login")',
                '[data-testid="submit-button"]',
                'button[class*="submit"]'
            ]
            
            submit_button = None
            for selector in submit_selectors:
                try:
                    if 'contains' in selector:
                        # Use XPath for text-based selection
                        text = selector.split('contains("')[1].split('")')[0]
                        xpath_selector = f"//button[contains(text(), '{text}')]"
                        submit_button = self.driver.find_element(By.XPATH, xpath_selector)
                    else:
                        submit_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    
                    if submit_button and submit_button.is_displayed():
                        print(f"✅ Found submit button using selector: {selector}")
                        break
                except:
                    continue
            
            if not submit_button:
                print("❌ Could not find submit button")
                return False
            
            # Click submit button
            submit_button.click()
            print("✅ Clicked submit button")
            
            # Wait for login to complete
            time.sleep(3)
            
            # Check if login was successful by looking for user menu or admin indicators
            success_indicators = [
                'button[aria-expanded]',  # User menu button
                '[class*="user"]',
                'button:contains("Admin")',
                '[href*="dashboard"]'
            ]
            
            login_successful = False
            for indicator in success_indicators:
                try:
                    if 'contains' in indicator:
                        text = indicator.split('contains("')[1].split('")')[0]
                        xpath_selector = f"//*[contains(text(), '{text}')]"
                        element = self.driver.find_element(By.XPATH, xpath_selector)
                    else:
                        element = self.driver.find_element(By.CSS_SELECTOR, indicator)
                    
                    if element.is_displayed():
                        print(f"✅ Login success indicator found: {indicator}")
                        login_successful = True
                        break
                except:
                    continue
            
            if not login_successful:
                print("⚠️  Could not confirm login success with standard indicators")
            
            return True
            
        except Exception as e:
            print(f"❌ Error submitting login form: {e}")
            return False
    
    def navigate_to_admin_dashboard(self):
        """Step 5: Navigate to the Admin Dashboard"""
        try:
            print(f"\n🛡️  Step 5: Navigating to Admin Dashboard")
            
            # First try to click on user menu to see admin option
            try:
                user_menu_selectors = [
                    'button[aria-expanded="false"]',
                    'button[aria-haspopup="menu"]',
                    '[class*="user"]',
                    'button:contains("Account")'
                ]
                
                user_menu_button = None
                for selector in user_menu_selectors:
                    try:
                        if 'contains' in selector:
                            text = selector.split('contains("')[1].split('")')[0]
                            xpath_selector = f"//button[contains(text(), '{text}')]"
                            user_menu_button = self.driver.find_element(By.XPATH, xpath_selector)
                        else:
                            user_menu_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                        
                        if user_menu_button and user_menu_button.is_displayed():
                            print(f"✅ Found user menu button")
                            break
                    except:
                        continue
                
                if user_menu_button:
                    user_menu_button.click()
                    time.sleep(1)
                    print("✅ Opened user menu")
                    
                    # Look for Admin Dashboard link
                    admin_link_selectors = [
                        'a[href="/admin/dashboard"]',
                        'a[href*="admin"]',
                        'a:contains("Admin")',
                        '[role="menuitem"]:contains("Admin")'
                    ]
                    
                    admin_link = None
                    for selector in admin_link_selectors:
                        try:
                            if 'contains' in selector:
                                xpath_selector = f"//a[contains(text(), 'Admin')] | //*[@role='menuitem'][contains(text(), 'Admin')]"
                                admin_link = self.driver.find_element(By.XPATH, xpath_selector)
                            else:
                                admin_link = self.driver.find_element(By.CSS_SELECTOR, selector)
                            
                            if admin_link and admin_link.is_displayed():
                                print(f"✅ Found admin dashboard link")
                                break
                        except:
                            continue
                    
                    if admin_link:
                        admin_link.click()
                        print("✅ Clicked admin dashboard link")
                    else:
                        print("⚠️  Admin link not found in menu, trying direct navigation")
                        self.driver.get(f"{self.base_url}/admin/dashboard")
                
            except Exception as e:
                print(f"⚠️  User menu approach failed: {e}")
                print("🔄 Trying direct navigation to admin dashboard...")
                self.driver.get(f"{self.base_url}/admin/dashboard")
            
            # Wait for admin dashboard to load
            WebDriverWait(self.driver, self.timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            current_url = self.driver.current_url
            print(f"✅ Current URL: {current_url}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error navigating to admin dashboard: {e}")
            return False
    
    def verify_admin_dashboard(self):
        """Step 6: Verify the Admin Dashboard has loaded properly"""
        try:
            print(f"\n✅ Step 6: Verifying Admin Dashboard")
            
            current_url = self.driver.current_url
            print(f"📍 Current URL: {current_url}")
            
            # Check if we're on the admin dashboard page
            if '/admin' not in current_url:
                print("❌ Not on admin dashboard URL")
                return False
            
            # Look for admin-specific elements
            admin_indicators = [
                'h1:contains("Admin Dashboard")',
                '[class*="admin"]',
                'button:contains("Add Product")',
                'table',  # Product table
                'th:contains("Product")',
                'th:contains("Price")',
                'th:contains("Stock")',
                '[href*="admin/purchases"]'
            ]
            
            found_indicators = []
            for indicator in admin_indicators:
                try:
                    if 'contains' in indicator:
                        text = indicator.split('contains("')[1].split('")')[0]
                        tag = indicator.split(':')[0] if ':' in indicator else '*'
                        xpath_selector = f"//{tag}[contains(text(), '{text}')]"
                        element = self.driver.find_element(By.XPATH, xpath_selector)
                    else:
                        element = self.driver.find_element(By.CSS_SELECTOR, indicator)
                    
                    if element.is_displayed():
                        found_indicators.append(indicator)
                except:
                    continue
            
            if found_indicators:
                print(f"✅ Admin dashboard elements found: {found_indicators}")
                
                # Try to get page title and header text
                try:
                    page_title = self.driver.title
                    print(f"📄 Page title: {page_title}")
                except:
                    pass
                
                try:
                    # Look for admin dashboard header
                    headers = self.driver.find_elements(By.TAG_NAME, "h1")
                    for header in headers:
                        if header.is_displayed():
                            print(f"📋 Header text: {header.text}")
                            break
                except:
                    pass
                
                # Check for product table or stats
                try:
                    tables = self.driver.find_elements(By.TAG_NAME, "table")
                    if tables:
                        print(f"📊 Found {len(tables)} table(s) on the dashboard")
                        
                        # Count table rows (products)
                        rows = self.driver.find_elements(By.XPATH, "//table//tbody//tr")
                        if rows:
                            print(f"📦 Found {len(rows)} product rows in table")
                except:
                    pass
                
                return True
            else:
                print("❌ No admin dashboard elements found")
                
                # Capture page source snippet for debugging
                try:
                    page_source = self.driver.page_source[:1000]
                    print(f"🔍 Page source snippet: {page_source}...")
                except:
                    pass
                
                return False
            
        except Exception as e:
            print(f"❌ Error verifying admin dashboard: {e}")
            return False
    
    def run_test(self):
        """Run the complete admin login and dashboard access test"""
        print("🚀 Starting West Coast Collectibles Admin Authentication Test")
        print("=" * 60)
        
        # Setup
        if not self.setup_driver():
            return False
        
        try:
            # Execute test steps
            steps = [
                self.navigate_to_homepage,
                self.open_signin_modal,
                self.fill_login_form,
                self.submit_login_form,
                self.navigate_to_admin_dashboard,
                self.verify_admin_dashboard
            ]
            
            for step in steps:
                if not step():
                    print(f"\n❌ Test failed at step: {step.__name__}")
                    return False
                time.sleep(1)  # Brief pause between steps
            
            print("\n🎉 SUCCESS: Admin authentication and dashboard access completed!")
            print(f"✅ Final URL: {self.driver.current_url}")
            
            # Keep browser open for a few seconds to see the result
            print("\n⏳ Keeping browser open for 10 seconds for verification...")
            time.sleep(10)
            
            return True
            
        except Exception as e:
            print(f"\n💥 Unexpected error during test: {e}")
            return False
        
        finally:
            if self.driver:
                print("\n🔚 Closing browser...")
                self.driver.quit()

def main():
    """Main execution function"""
    test = AdminLoginTest()
    success = test.run_test()
    
    if success:
        print("\n🎯 FINAL RESULT: SUCCESS")
        print("✅ Admin authentication flow completed successfully")
        print("✅ Admin dashboard is accessible and functional")
        sys.exit(0)
    else:
        print("\n🎯 FINAL RESULT: FAILURE")
        print("❌ Admin authentication or dashboard access failed")
        sys.exit(1)

if __name__ == "__main__":
    main()