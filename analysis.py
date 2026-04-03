from dotenv import load_dotenv
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
import boto3
from langchain_core.output_parsers import StrOutputParser,JsonOutputParser

load_dotenv()
gemini_api = os.getenv("GOOGLE_API_KEY")
gemini_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
output_parser = StrOutputParser()
json_parser = JsonOutputParser()
access_key = os.getenv("AWS_ACCESS_KEY_ID")
secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")

s3_client = boto3.client('s3', aws_access_key_id= access_key, aws_secret_access_key=secret_key )  # Create an S3 client
bucket_name = "esg-icon-v1"

class Scope:
    def run(self,company,user_input):
        news_content = self.read_file("NEWS",company)
        esg_content = self.read_file("ESG",company)
        sec_content =  self.read_file("SEC",company)

        template = """
            ESG Investment Analysis & Company Sustainability Report Prompt
            You are an ESG investment analyst with expertise in evaluating companies' sustainability performance, risk factors, regulatory compliance, and financial impact. Your task is to generate a comprehensive, investor-focused ESG performance report based on structured input data. This report must integrate the following:
                1. Investor Profile & Preferences: Customizes the analysis based on investor type, risk tolerance, ESG priority weightage, and investment horizon.
                2. Company Information: Sector, company name, and industry benchmarking.
                3. ESG Parameter Selection: Customized analysis based on selected Environmental, Social, and Governance (E, S, G) factors.
                4. Risk Assessment & Compliance Check: Evaluates ESG risks, controversies, and regulatory adherence.
                5. ESG Impact & Valuation Metrics: Financial influence of ESG factors, stock price impact, and risk-adjusted returns.
                6. Customization Preferences: Generates a summary, detailed, or technical report with optional industry benchmarking and interactive visual elements.

                Note: Provide output based on the input data, don't mention data unavaialbility in output.
            Input Data:
            User input: {user_input}
            SEC Report: {sec_report}
            ESG Report: {esg_report}
            News Report: {news_report}

            ## **Output Format:**

            # **ESG Performance Report for [Company XYZ]**

            ## 1. **Company Overview**
            - **Company Name:** [Company XYZ]  
            - **Ticker:** [Ticker Symbol]  
            - **Sector:** Technology  
            - **Headquarters:** [Location]  
            - **Key Financials:** Revenue, Market Cap, Profit Margins  
            - **ESG Industry Classification:** [Classification Based on Data]  
            - **Investor Takeaway:** High-level summary of sustainability strengths & risks  
            - **Overview:** Provide the overview of the company  

            

            ## **ESG Scoring**
            - **ESG Score Summary:** Overall ESG Risk Level – Low/Moderate/High  
            - **ESG Rating:** [Rating Scale: 1-5] ⭐⭐⭐⭐⭐  
            - **Investment Decision Insights:** 
                Buy /  Hold / Sell based on ESG impact.  

            

            ## 2. **ESG Risk Ratings**
            ### Environmental (E) Risks & Performance: [High/Medium/Low]
            - Summary of key environmental risks and performance in bullet points.

            ### Social (S) Risks & Performance:  [High/Medium/Low]
            - Summary of key social risks and performance in bullet points.  

            ### Governance (G) Risks & Performance:  [High/Medium/Low]
            - Summary of key governance risks and performance in bullet points.

            ### **Overall ESG Risk Rating:** [High / Moderate / Low]  
            - Summary of key risks and performance in bullet points.  

            

            ## 3. **Key Performance Indicators (KPIs)**
            - Provide the list of KPI in bullet points  

            ### **KPI Table:**  

            | KPI | Value |  
            |------|------|  
            | Carbon Footprint Reduction (%) | XX% |  
            | Board Diversity (%) | XX% |  
            | Employee Turnover Rate | XX% |  

            

            ## 4. **Greenwashing Identifiction** 
            You are an expert in ESG analysis, trained to detect greenwashing by analyzing corporate sustainability reports, financial disclosures, and external media sources. Your task is to extract, verify, and assess ESG claims for potential greenwashing risks.
            Instructions:
            Identify and extract ESG-related claims from the provided ESG report.
            Cross-Verify with External Sources:
                For each claim, verify its accuracy using the following sources:
                    SEC Report (Financial and regulatory disclosures)
                    News Articles (External independent sources?
                    Third-Party Certifications (LEED, SBTi, CDP, etc.)
            Project the output in tablular format (ESG Claim, Verification (SEC, News, Certifications),	Greenwashing Risk, Justification for Greenwashing Risk).
            In Verification column, include only the available sources, don't mention if no data is available in the sources.
            Summarize findings.
            Add a note saying that these analysis is solely based on the available data and may not reflect the complete picture.

            

            ## 5. **ESG Risk Factors & Controversies**  

            - **Environmental Risks:** 
                Explain the environmental risks like Climate change exposure, carbon tax, resource depletion, regulatory changes  
            - **Social Risks:** 
                Explain the environmental risks like Labor rights violations, supply chain issues, cybersecurity breaches  
            - **Governance Risks:** 
                Explain the environmental risks like Corporate fraud, regulatory non-compliance, weak oversight, executive pay misalignment  

            ### **Recent ESG Controversies**  

            | Incident | Date | Impact |
            |----------|------|--------|
            | Data Breach | 2024 | High |
            | Emissions Violation | 2023 | Medium |

            

            ## 6. **ESG Policies & Compliance Check**  
            - **Environmental Policies:**  
                Explain the environment related policies in detail like Emissions reduction targets
            - **Social Policies:**  
                Explain the social related policies in detail like Workforce diversity programs  
            - **Governance Policies:**  
                Explain the governance related policies in detail like Board accountability measures 
            - **Regulatory Compliance:** 
                Explain the Compliance data available in all reports  

            ### Compliance Table:  

            | Policy Type | Key Policies | Compliance Status |
            |-------------|-------------|-------------------|
            | Environmental | Emissions reduction targets | Compliant |
            | Social | Workforce diversity programs | Compliant |
            | Governance | Board accountability measures | Non-Compliant |
            | Regulatory | SEC & ESG Report Compliance | Partial Compliance |

           

            ## 7. **ESG Initiatives**  
            - **Ongoing Projects:** 
                 [Green tech investments, social responsibility programs, governance reforms.]  
            - **Future Goals:** 
                 [Planned ESG goals, targets, and corporate strategy adjustments.]  

            

            ## 8. **ESG Impact on Valuation & Investment Risks**  
            - **Financial Impact:**  
            - Identify connections between ESG performance and financial metrics (e.g., cost savings from energy efficiency, revenue from sustainable products).  
            - Highlight trends over time, such as improvements or declines in ESG-related financial impact.  
            - Explain how ESG risks/opportunities influence **cost structure, revenue streams, and investor sentiment.**  

            

            ## 9. **ESG Trends & Regulatory Outlook**  
            - **Upcoming ESG Regulations:** [SEC, CSRD, SFDR updates]  
            - **Emerging Market Trends:** [Green bonds, sustainable investing growth]  
            - **Future Policy Shifts:** [Regulatory changes affecting the company’s ESG strategy.]  

            

            ## 10. **Conclusion & Investment Recommendations**  
            - **Actionable Steps:** [Opportunities for engagement with the company on ESG improvements for investors.]  
            - **Key Focus Areas for Investors:** 
                Create a more detaied focus areas for invetors which will be helpful for investors to make wise decision. 

            

            ## 11. **Summary of Overall ESG Performance**  
            - Concise summary and final evaluation of the company’s ESG standing.  


            **Final Output:**
            A detailed, data-driven, interactive ESG performance report tailored to investor preferences, industry benchmarks, and company-specific ESG performance.
        """
        prompt = PromptTemplate(
                input_variables=["user_input", "sec_report", "esg_report", "news_report"],
                template=template)
        
        chain = prompt | gemini_model | output_parser
        final_analysis = chain.invoke({"sec_report": sec_content, 
                                        "esg_report": esg_content, 
                                        "news_report": news_content,
                                        "user_input":user_input})
        with open("agents/output/analysis_report.md", "w", encoding="utf-8") as file:
            file.write(final_analysis)

    def translator(self,report_type,report_content):
        template = """
        You are a professional translator fluent in both English and French. Your task is to translate the given content into French while maintaining the original meaning, 
        structure, and formatting. Do not alter any non-translatable elements such as code, numbers, or special characters. 
        Do not include backticks (```) in the response.
        ### Content to Translate:
        {report}

        ### Output:
        Provide the French translation of the above content, keeping the formatting intact.
        """

        prompt = PromptTemplate(
                input_variables=["report"],
                template=template)
        
        chain = prompt | gemini_model | output_parser
        translated_report = chain.invoke({"report": report_content})
        with open(f"agents/output/{report_type}_report_french.md", "w", encoding="utf-8") as file:
            file.write(translated_report)

    def read_file(self,report_name, company):
        key = f"{report_name}/{company}_{report_name}.md"
        response = s3_client.get_object(Bucket=bucket_name, Key=key)
        content = response['Body'].read().decode('utf-8')
        return content
    
    def populate(self,message,scenario_type,options):
        template = """
            You are an expert ESG analyst. A user has provided a scenario and you must select the most relevant key metrics.

            The user's scenario is:
            {message} and {scenario_type}

            You MUST choose metrics ONLY from the following lists.
            Do not add any metrics that are not in these lists.
            The metric strings in your JSON response must match EXACTLY.

            {options}

            Based on the user's scenario, provide a JSON object containing your selections.
            The JSON output must follow this format:
            {{
            "environment": [],
            "social": [],
            "governance": []
            }}

            ### Output JSON:
        """
        prompt = PromptTemplate(
                input_variables=["message","scenario_type","options"],
                template=template)

        chain = prompt | gemini_model | json_parser
        options = chain.invoke({"message": message,"scenario_type":scenario_type,"options":options})
        return options