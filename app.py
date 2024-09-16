from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/scrape', methods=['POST'])
def scrape_rate_my_professor():
    print("Received request")

    data = request.json
    link = data.get('link')

    if not link:
        return jsonify({'error': 'No link provided'}), 400

    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run Chrome in headless mode
        chrome_options.add_argument('--allow-insecure-localhost')

        service = Service(executable_path='chromedriver.exe')  # Path to your ChromeDriver
        driver = webdriver.Chrome(service=service, options=chrome_options)

        #print(driver.page_source)

        driver.get(link)

        # Wait for the professor's first name using XPath
        professor_first_name = driver.find_element(By.XPATH, '//div[@class="NameTitle__Name-dowf0z-0 cfjPUG"]/span[1]').get_attribute('textContent')
        print(professor_first_name)

        # Wait for the professor's last name using XPath
        professor_last_name = driver.find_element(By.XPATH, '//div[@class="NameTitle__Name-dowf0z-0 cfjPUG"]/span[contains(@class, "NameTitle__LastNameWrapper-dowf0z-2")]').get_attribute('textContent')
        print(professor_last_name)

        # Combine first and last name
        professor_name = f"{professor_first_name} {professor_last_name}"

        #wait for the rating
        stars = driver.find_element(By.XPATH, '//div[@class="RatingValue__Numerator-qw8sqy-2 liyUjw"]').get_attribute("textContent")
        stars = stars.strip()
        stars_float = float(stars) 
        stars = int(stars_float)

        print(stars)

        #wait for the subject.
        subject = driver.find_element(By.XPATH,'//div[@class="NameTitle__Title-dowf0z-1 iLYGwn"]//a[@class="TeacherDepartment__StyledDepartmentLink-fl79e8-0 iMmVHb"]/b').text
        #print(subject)

        # Check if the text ends with "Department"
        if subject.lower().endswith('department'):
            subject = subject.rsplit(' ', 1)[0]  # Split from the right and take the part before the last space
        else:
            subject = subject  # If it doesn't end with "Department", just use the text as is

        print(subject)


        review = driver.find_element(By.XPATH, '//ul[@class="RatingsList__RatingsUL-hn9one-0 cbdtns"]/li[1]//div[@class="Comments__StyledComments-dzzyvm-0 gRjWel"]').get_attribute('textContent')
        print(review)
        # Close the browser
        driver.quit()

        # Return the scraped data
        return jsonify({
            'professor': professor_name,
            'subject':subject,
            'stars': stars,
            'review':review
        })

    except Exception as e:
        print(f'Error: {str(e)}')  # Log the error
        driver.quit()  # Ensure browser is closed on error
        return jsonify({'error': f'Error scraping data: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=5000)
