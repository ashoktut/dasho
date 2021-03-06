import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import { TileBaseComponent } from '../../models/basetile.model';
import { Setting } from '../../models/setting.model';
import { NgxPubSubService } from '@pscoped/ngx-pub-sub';

@Component({
  selector: 'grid-clock',
  templateUrl: 'clock.html',
  styleUrls: ['clock.scss'],
})

/**
 * Represents a clock tile.
 */
export class ClockTileComponent extends TileBaseComponent implements OnInit, OnDestroy {
  @Input() tile: Setting;
  @Output() notify: EventEmitter<object> = new EventEmitter<object>();
  Highcharts = Highcharts;
  options: any | boolean = false;
  private interval: any;

  /**
   * Create the clock tile
   * @constructor
   * @param  {pubSub} NgxPubSubService used to subscribe to the `data:ready` event
   */
  constructor(private pubSub: NgxPubSubService) {
    super();

    this.setMathBounce();
  }

  ngOnInit(): void {
    this.pubSub.subscribe('data:ready', () => {
      this.onReady();
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  /**
   * A callback function for the created chart / makes the clock move.
   * @param {Highcharts} chart The current Chart
   * @returns {void}
   */
  startMoveClock(chart: any): void {
    this.interval = setInterval(() => {
      if (chart.axes) { // not destroyed
        const hour = chart.get('hour');
        const minute = chart.get('minute');
        const second = chart.get('second');

        // run animation unless we're wrapping around from 59 to 0
        const animation = moment()
          .seconds() === 0 ? false : { easing: 'easeOutBounce' };

        hour.update(moment()
          .hours() + moment()
            .minutes() / 60, true, animation);
        minute.update(moment()
          .minutes() * 12 / 60 + moment()
            .seconds() * 12 / 3600, true, animation);
        second.update(moment()
          .seconds() * 12 / 60, true, animation);
      }
    }, 1000);
  }

  /**
   * Clear the interval and set the options for the highchart clock
   */
  onReady(): void {
    clearInterval(this.interval);

    const now = {
      hours: moment()
        .hours() + moment()
          .minutes() / 60,
      minutes: moment()
        .minutes() * 12 / 60 + moment()
          .seconds() * 12 / 3600,
      seconds: moment()
        .seconds() * 12 / 60
    };

    this.options = {
      credits: {
        enabled: false
      },
      title: {
        text: undefined
      },
      chart: {
        type: 'gauge',
        backgroundColor: 'transparent',
        plotBorderWidth: 0,
        plotShadow: false,
        height: 230,
        width: 230
      },
      tooltip: {
        enabled: false
      },
      pane: {
        background: [{
        }, {
          backgroundColor: 1 ? {
            radialGradient: {
              cx: 0.5,
              cy: -0.4,
              r: 1.9
            },
            stops: [
              [0.5, 'rgba(255, 255, 255, 0.2)'],
              [0.5, 'rgba(200, 200, 200, 0.2)']
            ]
          } : undefined
        }]
      },
      yAxis: {
        labels: {
          distance: -20
        },
        min: 0,
        max: 12,
        lineWidth: 0,
        showFirstLabel: false,
        minorTickInterval: 'auto',
        minorTickWidth: 1,
        minorTickLength: 5,
        minorTickPosition: 'inside',
        minorGridLineWidth: 0,
        minorTickColor: '#666',
        tickInterval: 1,
        tickWidth: 2,
        tickPosition: 'inside',
        tickLength: 10,
        tickColor: '#666',
        title: {
          text: 'dasho',
          style: {
            color: '#BBB',
            fontWeight: 'normal',
            fontSize: '8px',
            lineHeight: '10px'
          },
          y: 10
        }
      },
      series: [{
        data: [{
          id: 'hour',
          y: now.hours,
          dial: {
            radius: '60%',
            baseWidth: 4,
            baseLength: '95%',
            rearLength: 0
          }
        }, {
          id: 'minute',
          y: now.minutes,
          dial: {
            baseLength: '95%',
            rearLength: 0
          }
        }, {
          id: 'second',
          y: now.seconds,
          dial: {
            radius: '100%',
            baseWidth: 1,
            rearLength: '20%'
          }
        }],
        animation: false,
        dataLabels: {
          enabled: false
        }
      }]
    };
  }

  /**
   * Animation timing function specifies the speed curve of the animation from the clockhand.
   */
  setMathBounce(): void {
    Object.defineProperty(Math, 'easeOutBounce', {
      value: (pos: number) => {
        if ((pos) < (1 / 2.75)) {
          return (7.5625 * pos * pos);
        }

        if (pos < (2 / 2.75)) {
          return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
        }

        if (pos < (2.5 / 2.75)) {
          return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
        }

        return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
      }
    });
  }
}
