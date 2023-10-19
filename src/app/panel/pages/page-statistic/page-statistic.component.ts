import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TaskService } from '../../services/task.service';

//import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-page-statistic',
  templateUrl: './page-statistic.component.html',
  styleUrls: ['./page-statistic.component.scss']
})
export class PageStatisticComponent implements OnInit {
  labels:any[] = [];
  tareasPendientes: any[] = [];
  tareasFinalizadas: any[] = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor(private httpTaskServices: TaskService){}

  ngOnInit(): void {
    this.MostarEstadisticas();
  }

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  
    scales: {
      x: {},
      y: {
        min: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      
    },
  };

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: this.labels,
    datasets: [
      { data: this.tareasPendientes, label: 'Pendientes' },
      { data: this.tareasFinalizadas, label: 'Finalizadas' },
    ],
  };

  public chartClicked({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  public chartHovered({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }


  MostarEstadisticas(){
    this.httpTaskServices.estadisticasPorUsuarios().subscribe({
      next:(res: any) => {
        res.data.forEach((item: any) => {
          
          this.labels.push(item.nombres);
          this.tareasPendientes.push(item.detalle.tareasPendientes);
          this.tareasFinalizadas.push(item.detalle.tareasFinalizadas);
        });
      },
    });

    this.crearGrafico();
  }

  crearGrafico() {
    this.barChartData = {
      labels: this.labels,
      datasets: [
        { data: this.tareasPendientes, label: 'Pendientes' },
        { data: this.tareasFinalizadas, label: 'Finalizadas' },
      ],
    };
  }
}
