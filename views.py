from django.shortcuts import render
from django.http import HttpResponse

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


