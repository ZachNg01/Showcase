from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/survey")
async def get_survey(request: Request):
    return templates.TemplateResponse("survey.html", {"request": request})

@app.post("/submit")
async def submit_survey(request: Request, 
                         question1: str = Form(...), 
                         question2: str = Form(...)):
    # Process the form data
    print(question1, question2)
    return {"message": "Survey submitted successfully"}