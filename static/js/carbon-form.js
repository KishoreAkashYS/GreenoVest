const stepMenuOne = document.querySelector('.formbold-step-menu1');
const stepMenuTwo = document.querySelector('.formbold-step-menu2');
const stepMenuThree = document.querySelector('.formbold-step-menu3');

const stepOne = document.querySelector('.formbold-form-step-1');
const stepTwo = document.querySelector('.formbold-form-step-2');
const stepThree = document.querySelector('.formbold-form-step-3');

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

        formSubmitBtn.textContent = 'Review & Submit';
    } 
    else if (stepMenuThree.classList.contains('active')) {
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

        formSubmitBtn.textContent = 'Next Step';
    } 
});


function updateReview() {
    const reviewList = document.getElementById("review-list");
    reviewList.innerHTML = "";
    
    const fields = ["sector", "company", "forecast-window",
        "timeline","ipcc","scope","investment-preference"
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            let value = "";
            if (fieldId === "ipcc" || fieldId === "scope" || fieldId === "investment-preference") {
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


document.getElementById("confirm-checkbox").addEventListener("change", function() {
    document.getElementById("launch-form").disabled = !this.checked;
});

document.querySelector(".formbold-btn").addEventListener("click", updateReview);

const previewContainer = document.getElementById('preview-container');
const formContainer = document.getElementById('form-container');