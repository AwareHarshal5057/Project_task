from django.urls import path
from.import views

urlpatterns = [
    # path('',views.home,name='home')
    path('',views.index,name='index'),
    path('bar',views.bar,name='bar'),
    path('wave',views.wave,name='wave'),
    path('heatmap',views.heatmap,name='heatmap'),
    path('line',views.line,name='line'),

]


