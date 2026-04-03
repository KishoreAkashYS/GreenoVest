from flask import Flask,render_template,request,jsonify,url_for,send_file,redirect
import warnings
import json
from crew import Scenario,Carbon
from analysis import Scope
from utils import *
import re
import time
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin,LoginManager, login_user, login_required, logout_user
from flask_wtf import FlaskForm
from wtforms import StringField,PasswordField,SubmitField
from wtforms.validators import InputRequired,Length,ValidationError
from flask_bcrypt import Bcrypt

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

app = Flask(__name__)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = "greenovest"
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model,UserMixin):
    id = db.Column(db.Integer,primary_key=True)
    username = db.Column(db.String(20),nullable=False,unique=True)
    phonenum = db.Column(db.String(14),nullable=False,unique=True)
    password = db.Column(db.String(80),nullable=False)

class RegisterForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})
    phonenum = StringField(validators=[InputRequired(), Length(min=13, max=14)], render_kw={"placeholder": "Phonenumber"})
    password = PasswordField(validators=[InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
    submit = SubmitField('Register')

    def validate_username(self, username):
        existing_user_username = User.query.filter_by(username=username.data).first()
        if existing_user_username:
            raise ValidationError('That username already exists. Please choose a different one.')

class LoginForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})
    password = PasswordField(validators=[InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
    submit = SubmitField('Login')

@app.route('/login',methods=['GET','POST'])
def login():
    global ans,name,error
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect("/")
        else:
            error = "Username or Password is incorrect"
            return render_template('login.html', form=form, error=error)
    return render_template('login.html',form=form)

@app.route('/register',methods=['POST','GET'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = User(username=form.username.data, phonenum=form.phonenum.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('register.html',form=form)

@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route("/", methods=["GET", "POST"])
def index():
    data = get_companies()
    if request.method == 'POST':
        ticker = request.form.get('ticker')
        if ticker:
            # Redirect to the profile page with the selected ticker
            return redirect(url_for('profile', ticker=ticker))
    return render_template("index.html", companies = data)


@app.route("/profile")
@login_required
def profile():
    ticker = request.args.get("ticker", "AMZN")  
    stock_data = get_stock_data(ticker)  # Fetch stock data
    esg_data = get_data_by_ticker(ticker)
    stock_news = get_stock_news(ticker)
    risk = get_esg_risk(esg_data[7])
    company_data = get_company_data(ticker)
    return render_template("profile.html", ticker=ticker, stock_data=json.dumps(stock_data), esg_data=esg_data, stock_news=stock_news, risk=risk, about_data = company_data)

@app.route("/stock-data/<ticker>")
@login_required
def stock_data(ticker):
    return jsonify(get_stock_data(ticker))

def analysis_run(company,user_input):
    Scope().run(company=company, user_input=user_input)

def translate(report_type,report_content):
    Scope().translator(report_type, report_content)

@app.route("/analysis/<ticker>",methods=["GET","POST"])
@login_required
def analysis(ticker):
    if request.method=="POST":
        investment_type = request.form.get("inv-type")
        investment_horizon = request.form.get("inv-horizon")
        risk_tolerance = request.form.get("riskLevel")
        environmental_w = request.form.get("env-w")
        social_w = request.form.get("soc-w")
        governance_w = request.form.get("gov-w")
        sector = request.form.get("sector")
        company = request.form.get("company")
        env = request.form.getlist("environment[]")
        soc = request.form.getlist("social[]")
        gov = request.form.getlist("governance[]")
        risk_appetite = request.form.get("risk-appetite")
        rep = request.form.get("rep")
        sbc = request.form.get("Sbc")
        user_input = {
            "investor_profile": {
                "investment_type": investment_type,
                "investment_horizon": investment_horizon,
                "risk_tolerance": risk_tolerance,
                "esg_priority_weightage": {
                "environmental-w": environmental_w,
                "social-w": social_w,
                "governance-w": governance_w
                }
            },
            "company_selection": {
                "sector": sector,
                "company_name": company
            },
            "esg_parameters": {
                "environmental": env,
                "social": soc,
                "governance": gov
            },
            "esg_risk_assessment": {
                "risk_appetite": risk_appetite,
                "regulatory_exposure_preference": rep,
                "sector_benchmark_comparison": sbc
            }
        }
        time.sleep(5)
        # analysis_run(company,user_input)
        file_location = "agents/output/analysis_report.md"
        with open(file_location,'r',encoding="utf-8") as f:
            output_en = f.read()
            output_en = re.sub(r'`{1,3}.*?`{1,3}', '', output_en)
        # translate("analysis", output_en)
        with open(file_location.replace("report", "report_french"), 'r', encoding="utf-8") as f:
            output_fr = f.read()
            output_fr = re.sub(r'`{1,3}.*?`{1,3}', '', output_fr)
        return render_template("report.html",
                               output_en=output_en,output_fr=output_fr,ticker=ticker,
                               company=company,
                               title="Ecoscope - Report",
                               filepath_en=file_location,
                               filepath_fr=file_location.replace("report","report_french"))
    if request.method=="GET":
        esg_data = get_data_by_ticker(ticker)
        company = esg_data[12]
        sector = esg_data[3]
        return render_template("analysis.html",company=company,sector=sector,ticker=ticker)

def simulator_run(inputs):
    Scenario().crew().kickoff(inputs=inputs)

@app.route("/scenario/<ticker>",methods=["GET","POST"])
@login_required
def scenario(ticker):
    if request.method=="POST":
        sector = request.form.get("sector")
        company = request.form.get("company")
        scenario_type = request.form.get("scenario-type")
        geography = request.form.get("geography")
        timeframe = request.form.get("timeframe")
        env = request.form.getlist("environment[]")
        soc = request.form.getlist("social[]")
        gov = request.form.getlist("governance[]")
        message = request.form.get("message")

        user_input = {
            "company": company,
            "sector": sector,
            "market_cap": scenario_type,
            "geography": geography,
            "timeframe": timeframe,
            "scenario": message,
            "env": env,
            "soc": soc,
            "gov": gov
        }
        time.sleep(5)
        # simulator_run(user_input)
        file_location = "agents/output/simulation_report.md"
        with open(file_location,'r',encoding="utf-8") as f:
            output_en = f.read()
            output_en = re.sub(r'`{1,3}.*?`{1,3}', '', output_en)
        # translate("simulation", output_en)
        with open(file_location.replace("report", "report_french"), 'r', encoding="utf-8") as f:
            output_fr = f.read()
            output_fr = re.sub(r'`{1,3}.*?`{1,3}', '', output_fr)
        return render_template("report.html",
                               output_en=output_en,output_fr=output_fr,ticker=ticker,
                               company=company,
                               title="Envision - Report",
                               filepath_en=file_location,
                               filepath_fr=file_location.replace("report","report_french"))
    if request.method=="GET":
        esg_data = get_data_by_ticker(ticker)
        company = esg_data[12]
        sector = esg_data[3]
        return render_template("scenario.html",company=company,sector=sector,ticker=ticker)

@app.route('/generate_metrics', methods=['POST'])
def generate_metrics():
    data = request.get_json()
    scenario_type = data.get('scenario_type')
    message = data.get('message')
    options = data.get('options')
    values = Scope().populate(message,scenario_type,options)
    return jsonify(values)

@app.route('/download/<path:file_path>',methods=['GET','POST'])
@login_required
def download_file(file_path):
    try:
        return send_file(file_path, as_attachment=True)
    except FileNotFoundError:
        return "File not found", 404

def carbon_run(inputs):
    print("Running carbon crew with inputs:", inputs)
    Carbon().crew().kickoff(inputs=inputs)

@app.route("/carbon/<ticker>",methods=["GET","POST"])
@login_required
def carbon(ticker):
    if request.method=="POST":
        sector = request.form.get("sector")
        company = request.form.get("company")
        forecast = request.form.get("forecast-window")
        timeframe = request.form.get("timeline")
        ipcc = request.form.getlist("ipcc[]")
        scope = request.form.getlist("scope[]")
        preference = request.form.getlist("investment-preference[]")

        user_input = {
            "company": company,
            "sector": sector,
            "forecast": forecast,
            "timeframe": timeframe,
            "ipcc": ipcc,
            "scope": scope,
            "preference": preference
        }
        time.sleep(5)
        # carbon_run(user_input)
        file_location = "agents/output/emission_report.md"
        with open(file_location,'r',encoding="utf-8") as f:
            output_en = f.read()
            output_en = re.sub(r'`{1,3}.*?`{1,3}', '', output_en)
        # translate("emission", output_en)
        with open(file_location.replace("report", "report_french"), 'r', encoding="utf-8") as f:
            output_fr = f.read()
            output_fr = re.sub(r'`{1,3}.*?`{1,3}', '', output_fr)
        return render_template("report.html",
                               output_en=output_en,output_fr=output_fr,ticker=ticker,
                               company=company,
                               title="Carbonsight - Report",
                               filepath_en=file_location,
                               filepath_fr=file_location.replace("report","report_french"))
    if request.method=="GET":
        esg_data = get_data_by_ticker(ticker)
        company = esg_data[12]
        sector = esg_data[3]
        return render_template("carbon.html",company=company,sector=sector,ticker=ticker)

if __name__=="__main__":
    app.run()