from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from dotenv import load_dotenv
import os
from agents.tools import s3_tool

load_dotenv()
gemini_api = os.getenv("GOOGLE_API_KEY")
os.environ["SERPER_API_KEY"]  = os.getenv("SERPER_API")
gemini_llm = LLM(api_key = gemini_api, model="gemini/gemini-2.5-pro")

AWS_ACCESS_KEY_ID = os.getenv("MODEL_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.getenv("MODEL_SECRET_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_REGION")
MODEL_NAME = os.getenv("MODEL_NAME")
llm = LLM(model = MODEL_NAME, 
		  aws_access_key_id=AWS_ACCESS_KEY_ID,
          aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
          aws_region_name=AWS_DEFAULT_REGION)

s3 = s3_tool.S3Tool()

@CrewBase
class Scenario():
	agents_config = 'agents/config/envision/agents.yaml'
	tasks_config = 'agents/config/envision/tasks.yaml'

	@agent
	def esg_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['esg_agent'],
			verbose=True,
			llm=llm,
			allow_delegation=False,
			tools = [s3.obj_file_read]
		)

	@agent
	def sec_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['sec_agent'],
			verbose=True,
			llm=llm,
			allow_delegation=False,
			tools = [s3.obj_file_read]
		)
	
	@agent
	def news_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['news_agent'],
			verbose=True,
			llm=llm,
			allow_delegation=False,
			tools = [s3.obj_file_read]
		)
	
	@agent
	def compliance_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['compliance_agent'],
			verbose=True,
			llm=llm,
			allow_delegation=False
		)
	
	@agent
	def esg_scoring_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['esg_scoring_agent'],
			verbose=True,
			llm=llm,
			allow_delegation=False,
			tools = [s3.db_read]
		)
	
	@agent
	def report_gen_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['report_gen_agent'],
			verbose=True,
			llm=llm,
			allow_delegation=False,
			markdown=True 
		)

	@task
	def esg_task(self) -> Task:
		return Task(
			config=self.tasks_config['esg_task'],
			async_execution=False,
			markdown=True 
		)
	
	@task
	def sec_task(self) -> Task:
		return Task(
			config=self.tasks_config['sec_task'],
			async_execution=False,
			markdown=True 
		)
	
	@task
	def news_task(self) -> Task:
		return Task(
			config=self.tasks_config['news_task'],
			async_execution=False,
			markdown=True 
		)
	
	@task
	def compliance_task(self) -> Task:
		return Task(
			config=self.tasks_config['compliance_task'],
			async_execution=False,
			markdown=True 
		)
	
	@task
	def scoring_task(self) -> Task:
		return Task(
			config=self.tasks_config['scoring_task'],
			async_execution=False,
			markdown=True 
		)
	
	@task
	def reporting_task(self) -> Task:
		return Task(
			config=self.tasks_config['reporting_task'],
			context=[self.esg_task(),self.sec_task(),self.news_task(),self.scoring_task(),self.compliance_task()],
			output_file='agents/output/simulation_report.md',
			markdown=True 
		)

	@crew
	def crew(self) -> Crew:

		return Crew(
			agents=self.agents, 
			tasks=self.tasks, 
			process=Process.sequential,
			verbose=True
		)
	

@CrewBase
class Carbon():
	agents_config = 'agents/config/carbonsight/agents.yaml'
	tasks_config = 'agents/config/carbonsight/tasks.yaml'

	@agent
	def ipcc_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['ipcc_agent'],
			verbose=True,
			llm=gemini_llm,
			allow_delegation=False
		)

	@agent
	def analyser_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['analyser_agent'],
			verbose=True,
			llm=gemini_llm,
			allow_delegation=False,
			tools = [s3.obj_file_read]
		)
	
	@agent
	def report_gen_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['report_gen_agent'],
			verbose=True,
			llm=gemini_llm,
			allow_delegation=False
		)

	@task
	def ipcc_task(self) -> Task:
		return Task(
			config=self.tasks_config['ipcc_task'],
			async_execution=False,
			markdown=True 
		)
	
	@task
	def analyse_task(self) -> Task:
		return Task(
			config=self.tasks_config['analyse_task'],
			async_execution=False,
			markdown=True 
		)
	
	@task
	def reporting_task(self) -> Task:
		return Task(
			config=self.tasks_config['reporting_task'],
			context=[self.ipcc_task(),self.analyse_task()],
			output_file='agents/output/emission_report.md',
			markdown=True 
		)

	@crew
	def crew(self) -> Crew:

		return Crew(
			agents=self.agents, 
			tasks=self.tasks, 
			process=Process.sequential,
			verbose=True
		)