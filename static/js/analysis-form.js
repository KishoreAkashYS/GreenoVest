const stepMenuOne = document.querySelector('.formbold-step-menu1');
const stepMenuTwo = document.querySelector('.formbold-step-menu2');
const stepMenuThree = document.querySelector('.formbold-step-menu3');
const stepMenuFour = document.querySelector('.formbold-step-menu4');
const stepMenuFive = document.querySelector('.formbold-step-menu5'); // New step

const stepOne = document.querySelector('.formbold-form-step-1');
const stepTwo = document.querySelector('.formbold-form-step-2');
const stepThree = document.querySelector('.formbold-form-step-3');
const stepFour = document.querySelector('.formbold-form-step-4');
const stepFive = document.querySelector('.formbold-form-step-5'); // New step

const formSubmitBtn = document.querySelector('.formbold-btn');
const formBackBtn = document.querySelector('.formbold-back-btn');

formSubmitBtn.addEventListener("click", function(event) {
    event.preventDefault();

    if (stepMenuOne.classList.contains('active')) {
        stepMenuOne.classList.remove('active');
        stepMenuTwo.classList.add('active');

        stepOne.classList.remove('active');
        stepTwo.classList.add('active');

        formBackBtn.classList.add('active');
    } 
    else if (stepMenuTwo.classList.contains('active')) {
        stepMenuTwo.classList.remove('active');
        stepMenuThree.classList.add('active');

        stepTwo.classList.remove('active');
        stepThree.classList.add('active');
    } 
    else if (stepMenuThree.classList.contains('active')) {
        stepMenuThree.classList.remove('active');
        stepMenuFour.classList.add('active');

        stepThree.classList.remove('active');
        stepFour.classList.add('active');
    } 
    else if (stepMenuFour.classList.contains('active')) {
        stepMenuFour.classList.remove('active');
        stepMenuFive.classList.add('active');

        stepFour.classList.remove('active');
        stepFive.classList.add('active');

        formSubmitBtn.textContent = 'Review & Submit';
    }
    else if (stepMenuFive.classList.contains('active')) {
        document.querySelector('form').submit();
    }
});

formBackBtn.addEventListener("click", function(event) {
    event.preventDefault();

    if (stepMenuTwo.classList.contains('active')) {
        stepMenuTwo.classList.remove('active');
        stepMenuOne.classList.add('active');

        stepTwo.classList.remove('active');
        stepOne.classList.add('active');

        formBackBtn.classList.remove('active');
    } 
    else if (stepMenuThree.classList.contains('active')) {
        stepMenuThree.classList.remove('active');
        stepMenuTwo.classList.add('active');

        stepThree.classList.remove('active');
        stepTwo.classList.add('active');
    } 
    else if (stepMenuFour.classList.contains('active')) {
        stepMenuFour.classList.remove('active');
        stepMenuThree.classList.add('active');

        stepFour.classList.remove('active');
        stepThree.classList.add('active');
    }
    else if (stepMenuFive.classList.contains('active')) {
        stepMenuFive.classList.remove('active');
        stepMenuFour.classList.add('active');

        stepFive.classList.remove('active');
        stepFour.classList.add('active');

        formSubmitBtn.textContent = 'Next Step';
    }
});



const companiesBySector = {
    "IT": ["Meta", "Amazon"],
    "Semiconductor": ["Qualcomm", "Nvidia"],
    "FPMG": ["Coca-Cola","Starbucks"]
};

function updateCompanies() {
    const sector = document.getElementById("sector").value;
    const companyDropdown = document.getElementById("company");
    companyDropdown.innerHTML = "";
    
    companiesBySector[sector].forEach(company => {
        const option = document.createElement("option");
        option.value = company;
        option.textContent = company;
        companyDropdown.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", updateCompanies);

function updateReview() {
    const reviewList = document.getElementById("review-list");
    reviewList.innerHTML = "";
    
    const fields = ["investment-type","investment-horizon",
                    "environmental-weightage", "social-weightage", "governance-weightage",
                    "sector", "company", "environment", "social", "governance", 
                    "risk-appetite","rep"];
    
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
    const riskToleranceItem = document.createElement("div");
    riskToleranceItem.classList.add("review-item");

    const riskLabel = document.createElement("span");
    riskLabel.classList.add("review-label");
    riskLabel.innerHTML = "RISK TOLERANCE:";

    const riskContent = document.createElement("span");
    riskContent.classList.add("review-content");
    riskContent.innerHTML = getRiskTolerance();

    riskToleranceItem.appendChild(riskLabel);
    riskToleranceItem.appendChild(riskContent);
    reviewList.appendChild(riskToleranceItem);
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

document.addEventListener("DOMContentLoaded", function() {
    const environmentalInput = document.getElementById('environmental-weightage');
    const socialInput = document.getElementById('social-weightage');
    const governanceInput = document.getElementById('governance-weightage');
    const errorMessage = document.getElementById('error-message');
    const submitButton = document.querySelector('.formbold-btn');

    function validateTotal() {
        let environmental = parseInt(environmentalInput.value) || 0;
        let social = parseInt(socialInput.value) || 0;
        let governance = parseInt(governanceInput.value) || 0;
        let total = environmental + social + governance;

        if (total > 100) {
            errorMessage.textContent = "Total cannot exceed 100%. Adjust the values.";
            
            environmentalInput.setCustomValidity("Total cannot exceed 100%");
            socialInput.setCustomValidity("Total cannot exceed 100%");
            governanceInput.setCustomValidity("Total cannot exceed 100%");
            
            submitButton.disabled = true;  // ✅ Disable the button
        }else if (total < 100) {
            errorMessage.textContent = "Total should be 100%. Adjust the values.";
            
            environmentalInput.setCustomValidity("Total should be 100%");
            socialInput.setCustomValidity("Total should be 100%");
            governanceInput.setCustomValidity("Total should be 100%");
            
            submitButton.disabled = true;  // ✅ Disable the button
        }else {
            errorMessage.textContent = "";
            
            environmentalInput.setCustomValidity("");
            socialInput.setCustomValidity("");
            governanceInput.setCustomValidity("");

            submitButton.disabled = false; // ✅ Enable the button if valid
        }
    }

    // Attach event listeners to all three inputs
    environmentalInput.addEventListener("input", validateTotal);
    socialInput.addEventListener("input", validateTotal);
    governanceInput.addEventListener("input", validateTotal);
});












