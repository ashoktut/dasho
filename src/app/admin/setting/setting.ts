import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Setting } from '../../shared/setting.model';
import { Tile } from '../../shared/tile.model';

import { SettingService } from './setting.service';
import { UserService } from 'src/app/shared/user.service';
import { DashboardService } from 'src/app/main/main.service';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html'
})
export class SettingPage implements OnInit {

  currentUser: string;
  error: string;
  tiles: Array<Tile>;
  settings: Array<Setting>;
  selectedTile: string;
  hasChanged: boolean;

  constructor(
    public location: Location,
    private dashboardService: DashboardService,
    private settingService: SettingService,
    private userprovider: UserService,
    private alertCtrl: AlertController) {
  }

  ngOnInit(): void {
    this.userprovider.getUsername()
      .subscribe((username: string) => {
        this.currentUser = username;
        this.loadSettings();

        // get all tiles.
        this.settingService.getUnassignedTiles(this.currentUser)
          .subscribe((tiles: Array<Tile>) => {
            this.tiles = tiles;
          }, (error: HttpErrorResponse) => this.errorHandling(error));
      }, (error: HttpErrorResponse) => this.errorHandling(error));
  }

  loadSettings(): void {
    // get all Settings for the current User
    this.dashboardService.getSettings(this.currentUser)
      .subscribe((settings: Array<Setting>) => {
        this.settings = settings;
      }, (error: HttpErrorResponse) => this.errorHandling(error));
  }

  addItem(): void {
    this.settingService.addConfigs(this.currentUser, this.selectedTile)
      .subscribe(async (saved: boolean) => {
        if (saved) {
          const alert = await this.alertCtrl.create({
            header: 'Info!',
            message: 'Successfully saved!',
            backdropDismiss: false,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.loadSettings();
                }
              }
            ]
          });
          await alert.present();
        }
      }, (error: HttpErrorResponse) => this.errorHandling(error));
  }

  saveItem(setting: Setting): void {
    this.hasChanged = true;
    this.dashboardService.saveSetting(this.currentUser, setting)
      .subscribe(async (saved: boolean) => {
        if (saved) {
          const alert = await this.alertCtrl.create({
            header: 'Info!',
            message: 'Successfully saved!',
            backdropDismiss: false,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.loadSettings();
                }
              }
            ]
          });
          await alert.present();
        }
      }, (error: HttpErrorResponse) => this.errorHandling(error));
  }

  async deleteItem(setting: Setting): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Would you like to delete?',
      message: 'Successfully saved!',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            alert.present();
            this.dashboardService.deleteSetting(this.currentUser, setting)
              .subscribe((deleted: boolean) => {
                if (deleted) {
                  this.loadSettings();
                }
              });
          }
        },
        {
          text: 'No',
          handler: async () => {
            await alert.present();

            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Error Handler
   */
  private async errorHandling(error: HttpErrorResponse): Promise<void> {
    (error.status === 0) ? this.error = 'No Connection to the Backend!' : this.error = error.message;

    const alert = await this.alertCtrl.create({
      header: 'Error!',
      message: this.error,
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          handler: async () => {
            await alert.present();
          }
        }
      ]
    });
    await alert.present();
  }
}
