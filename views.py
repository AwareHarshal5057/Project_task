from django.shortcuts import render
from django.http import HttpResponse
from django.template.loader import render_to_string
from playwright.sync_api import sync_playwright

# def home(request):
#     return HttpResponse("hello,django")


def index(request):
    
    return render(request,"dashboard/index.html")

def line(request):

    return render(request,"dashboard/line-chart.html")

def bar(request):
    return render(request,"dashboard/bar-chart.html")

def heatmap(request):
    return render(request,"dashboard/heatmap-chart.html")

def wave(request):
    return render(request,"dashboard/wave-chart.html")


def generate_pdf(request):
    html = render_to_string("dashboard/pdf_report.html")

    with sync_playwright() as p:

        browser = p.chromium.launch()

        page = browser.new_page()

        page.set_content(html,wait_until="networkidle")

        pdf = page.pdf(
            format="A4",
            print_background=True,
            margin={
                "top": "20px",
                "bottom": "20px",
                "left": "20px",
                "right": "20px",
            },
        )

        browser.close()

    response = HttpResponse(
        pdf,
        content_type="application/pdf"
    )

    response["Content-Disposition"] = 'attachment; filename="dashboard-report.pdf"'

    return response