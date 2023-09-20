# COMP-8967-Climate-Neutral

### Introduction 

This web application, referred to as "Climate Neutral," will empower users to perform Multi-Objective Decision-Making (MODM) analyses, aiding them in evaluating and selecting the most optimal scenario among various alternatives, taking into account multiple critical factors. It is aimed at assisting users in making multi-objective decisions related to climate change and environmental issues. 

In various decision-making scenarios, especially those pertaining to climate change and environmental sustainability, individuals and organizations often encounter complex choices. These choices involve multiple factors or categories and multiple scenarios for each category. Selecting the best course of action becomes challenging due to the multitude of variables involved. The MODM method simplifies this process by providing a systematic way to analyze and suggest the best scenario based on the defined categories and their associated factors. 


### Features of the Climate Neutral Web Application 

The Climate Neutral web application will include the following key features: 

**1. Authentication:** The application will offer basic user authentication using Firebase to ensure that only authorized users can access its features. 

**2. Dynamic Input:** Users will have the flexibility to enter an arbitrary number of category-scenario combinations, providing a dynamic and adaptable environment. 

**3. Save and Import:** Users can save their input values as text files for future reference and import these files to reproduce previous results easily. 

**4. Visualization:** The application will perform MODM analysis and present the results in the form of interactive charts. These charts will display scenario scores ordered from left to right. 

**5. Category Information:** For each added category, users must provide essential information, including the category name, weight, direction (positive or negative impact), and evaluation type. 

**6. Scenario Information:** Users will enter scenario names and scenario values for each category. For linear evaluation type categories, numerical values will be provided, while descriptive categories will have options like "Very Low," "Low," "Medium," "High," and "Very High." 

**7. Desktop Optimization:** The web application's design will be optimized for desktop screens, as it involves tabular input and chart presentation, ensuring a seamless user experience. 

**8. Local Storage:** Climate Neutral will save user data in browser local storage, allowing users to retrieve their last saved data. Users will also have the option to create new categories and scenarios as needed. 

**9. Data Initialization:** The web application will check for previously stored data in browser local storage. If data exists, it will load that data; otherwise, it will provide an empty table for users to create new categories and scenarios or import inputs from a text file. 

### Working of MODM Analysis 

The MODM analysis in Climate Neutral operates as follows: 

**1. Conversion of Descriptive Categories:** Descriptive category values, such as "Very Low," "Low," "Medium," "High," and "Very High," are converted into their corresponding numerical equivalents for consistency. (e.g., Very Low = 2, Low = 4, Medium = 6, High = 8, Very High = 10) 

**2. Normalization of Scenario Values:** All scenario values for each category are normalized based on the following functions: 

   - For positive category direction: Linear score = ((min - x) / (max - min)) * 100 

   - For negative category direction: Linear score = ((x - min) / (max - min)) * 100 

**3. Scenario Ranking:** After normalization, the application calculates the summation of all category values for each scenario. The scenarios are then ranked in descending order based on these summations, providing users with a clear understanding of the most favorable options. 
