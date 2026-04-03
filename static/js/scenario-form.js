const stepMenuOne = document.querySelector('.formbold-step-menu1');
const stepMenuTwo = document.querySelector('.formbold-step-menu2');
const stepMenuThree = document.querySelector('.formbold-step-menu3');
const stepMenuFour = document.querySelector('.formbold-step-menu4');

const stepOne = document.querySelector('.formbold-form-step-1');
const stepTwo = document.querySelector('.formbold-form-step-2');
const stepThree = document.querySelector('.formbold-form-step-3');
const stepFour = document.querySelector('.formbold-form-step-4');

const formSubmitBtn = document.querySelector('.formbold-btn');
const formBackBtn = document.querySelector('.formbold-back-btn');

formSubmitBtn.addEventListener("click", function(event){
    event.preventDefault();

    if(stepMenuOne.classList.contains('active')) {
        stepMenuOne.classList.remove('active');
        stepMenuTwo.classList.add('active');

        stepOne.classList.remove('active');
        stepTwo.classList.add('active');

        formBackBtn.classList.add('active');
    } 
    else if(stepMenuTwo.classList.contains('active')) {
        const scenarioType = document.getElementById("scenario-type").value;
        const message = document.getElementById("message").value;
        const allOptions = {
            "environment": [
                "Data center energy consumption",
                "carbon footprint",
                "renewable energy use",
                "Water usage and conservation",
                "Biodiversity impact",
                "Waste management and recycling",
                "Air pollution control",
                "Sustainable raw material sourcing",
                "Toxic emissions and chemical waste",
                "Green infrastructure investment"
            ],
            "social": [
                "Content moderation",
                "Data privacy",
                "workforce diversity",
                "ethical AI practices",
                "Employee health and safety",
                "Fair wages and labor rights",
                "Community engagement",
                "Supply chain human rights",
                "Consumer protection and product safety",
                "Financial inclusion and accessibility"
            ],
            "governance": [
                "Board independence",
                "executive compensation",
                "regulatory compliance",
                "Shareholder rights",
                "Audit committee effectiveness",
                "Ethical business practices",
                "Anti-corruption and bribery policies",
                "Tax transparency",
                "Political contributions and lobbying",
                "Cybersecurity governance and risk management"
            ]
        };

        // Disable button and show loading text
        formSubmitBtn.disabled = true;
        formSubmitBtn.textContent = "Generating metrics...";

        // Send request to Flask
        fetch("/generate_metrics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                scenario_type: scenarioType,
                message: message,
                options: allOptions
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Metrics received:", data);
            // Helper to set multiple selected values
            function populateSelect(selectId, values) {
                const selectDiv = document.getElementById(selectId);
                if (!selectDiv) {
                    console.warn(`MultiSelect element not found for ID: ${selectId}`);
                    return;
                }

                // Normalize values
                const normValues = (values || []).map(v => v.trim().toLowerCase());

                // Get all option divs
                const options = selectDiv.querySelectorAll('.multi-select-option');
                if (!options.length) {
                    console.warn(`No .multi-select-option found for ID: ${selectId}`);
                    return;
                }

                // Deselect everything first by simulating clicks on selected ones
                options.forEach(option => {
                    if (option.classList.contains('multi-select-selected')) {
                        option.click();  // use internal logic
                    }
                });

                // Select only the ones in our JSON list
                options.forEach(option => {
                    const val = option.dataset.value.trim().toLowerCase();
                    if (normValues.includes(val) && !option.classList.contains('multi-select-selected')) {
                        option.click();  // triggers built-in add logic
                    }
                });
            }

            populateSelect("environment", data.environment || []);
            populateSelect("social", data.social || []);
            populateSelect("governance", data.governance || []);

            // Move to step 3 now
            stepMenuTwo.classList.remove('active');
            stepMenuThree.classList.add('active');

            stepTwo.classList.remove('active');
            stepThree.classList.add('active');
            
        })
        .catch(err => {
            console.error("Error generating metrics:", err);
            alert("Unable to auto-populate metrics. Please try again.");
        })
        .finally(() => {
            formSubmitBtn.disabled = false;
            formSubmitBtn.textContent = "Next Step";
        });
    } 
    else if(stepMenuThree.classList.contains('active')) {
        stepMenuThree.classList.remove('active');
        stepMenuFour.classList.add('active');

        stepThree.classList.remove('active');
        stepFour.classList.add('active');

        formSubmitBtn.textContent = 'Review & Submit';
    } 
    else if(stepMenuFour.classList.contains('active')) {
        document.querySelector('form').submit();
    }
});

formBackBtn.addEventListener("click", function(event){
    event.preventDefault();

    if(stepMenuTwo.classList.contains('active')) {
        stepMenuTwo.classList.remove('active');
        stepMenuOne.classList.add('active');

        stepTwo.classList.remove('active');
        stepOne.classList.add('active');

        formBackBtn.classList.remove('active');
    } 
    else if(stepMenuThree.classList.contains('active')) {
        stepMenuThree.classList.remove('active');
        stepMenuTwo.classList.add('active');

        stepThree.classList.remove('active');
        stepTwo.classList.add('active');
    } 
    else if(stepMenuFour.classList.contains('active')) {
        stepMenuFour.classList.remove('active');
        stepMenuThree.classList.add('active');

        stepFour.classList.remove('active');
        stepThree.classList.add('active');

        formSubmitBtn.textContent = 'Next Step';
    }
});

function updateReview() {
    const reviewList = document.getElementById("review-list");
    reviewList.innerHTML = "";
    
    const fields = ["sector", "company", "scenario-type", "geography", "environment", "social", "governance", "message"];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            let value = "";
            if (fieldId === "environment" || fieldId === "social" || fieldId === "governance") {
                // Fetch values from hidden input fields
                const hiddenInputs = document.querySelectorAll(`input[name='${fieldId}[]']`);
                value = Array.from(hiddenInputs).map(input => input.value).join(", ");
            } else {
                value = field.value;
            }

            // Create a styled review section
            const reviewItem = document.createElement("div");
            reviewItem.classList.add("review-item");
            
            const label = document.createElement("span");
            label.classList.add("review-label");
            label.innerHTML = `${fieldId.replace("-", " ").toUpperCase()}:`;
            
            const content = document.createElement("span");
            content.classList.add("review-content");
            content.innerHTML = value || "<em>Not defined</em>";
            
            reviewItem.appendChild(label);
            reviewItem.appendChild(content);
            reviewList.appendChild(reviewItem);
        }
    });
}

// Add CSS for better styling
const style = document.createElement("style");
style.innerHTML = `
    .review-item {
        background: #f8f9fa;
        padding: 8px 12px;
        margin: 5px 0;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    }
    .review-label {
        font-weight: bold;
        color: #333;
        flex: 1;
    }
    .review-content {
        color: #555;
        flex: 2;
        text-align: right;
    }
`;
document.head.appendChild(style);

// Attach event listener to update review when proceeding to Step 4
document.querySelector(".formbold-btn").addEventListener("click", updateReview);

document.querySelector(".formbold-btn").addEventListener("click", updateReview);

const previewContainer = document.getElementById('preview-container');
const formContainer = document.getElementById('form-container');