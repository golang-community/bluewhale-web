import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-layout',
  templateUrl: './group-layout.component.html',
  styleUrls: ['./group-layout.component.less'],
})
export class GroupLayoutComponent implements OnInit {
  isCollapsed = false;

  constructor() {}

  ngOnInit(): void {}
}
