import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ConfigMenuComponent } from 'src/app/shared/components/config-menu/config-menu.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }

async openMenu(event: any) {
  const popover = await this.popoverController.create({
    component: ConfigMenuComponent,
    event: event,
    translucent: true,
  });
  await popover.present();
}
}