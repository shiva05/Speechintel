import { Component, OnInit } from '@angular/core';
import { AgentPerformanceComponent } from '../agent-performance/agent-performance.component';
import { FilterDropdownService } from '../filter-dropdown/shared/filter-dropdown.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FileInfoService } from '../../components/call-recordings/shared/file-info.service';

@Component({
  selector: 'app-filter-dropdown',
  templateUrl: './filter-dropdown.component.html',
  styleUrls: ['./filter-dropdown.component.css']
})
export class FilterDropdownComponent implements OnInit {
  filterItemSelected: Subscription;

  constructor(public _filterDropdownService: FilterDropdownService, private _router: Router, public _fileInfoService : FileInfoService) { }
  ngOnInit() {
    this._filterDropdownService.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 'All',
      allowSearchFilter: true
    };
    this.filterItemSelected = this._filterDropdownService.filterDropdownSelection_agent.subscribe(data => {      
      if (this._router.url.lastIndexOf("agentPerformance") > 0) {
        this._filterDropdownService.dropdownList = data;
      }
      else if (this._router.url.lastIndexOf("callRecordings") > 0) {
        this._filterDropdownService.dropdownList = data;
      }
      else if (this._router.url.lastIndexOf("redAlerts") > 0) {
        this._filterDropdownService.dropdownList = data;
      }
      else if (this._router.url.lastIndexOf("callTranscripts") > 0) {
        this._filterDropdownService.dropdownList = data;
      }
      else if (this._router.url.lastIndexOf("disputedCalls") > 0) {
        this._filterDropdownService.dropdownList = data;
       // console.log(data);
      }
    });
  }

  onItemSelect(item: any) {
    if (this._filterDropdownService.catagoryList === 'AgentName') {
      this._filterDropdownService.selectedFilterOptions.AgentName = this._filterDropdownService.selectedItems;
    }
    else if (this._filterDropdownService.catagoryList === 'CustomerAccountNo') {
      this._filterDropdownService.selectedFilterOptions.CustomerAccountNo = this._filterDropdownService.selectedItems;
    }
    else if (this._filterDropdownService.catagoryList === 'CustomerPhoneNo') {
      this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo = this._filterDropdownService.selectedItems;
    }
    else if (this._filterDropdownService.catagoryList === 'ProgramName') {
      this._filterDropdownService.selectedFilterOptions.ProgramName = this._filterDropdownService.selectedItems;
    }
  //  console.log(this._filterDropdownService.selectedItems);
  }

  onSelectAll(items: any) {
    this._filterDropdownService.selectedItems = items;
    // console.log(this.selectedItems);
    if (this._filterDropdownService.catagoryList === 'AgentName') {
      this._filterDropdownService.selectedFilterOptions.AgentName = this._filterDropdownService.selectedItems;
    }
    else if (this._filterDropdownService.catagoryList === 'CustomerAccountNo') {
      this._filterDropdownService.selectedFilterOptions.CustomerAccountNo = this._filterDropdownService.selectedItems;
    }
    else if (this._filterDropdownService.catagoryList === 'CustomerPhoneNo') {
      this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo = this._filterDropdownService.selectedItems;
    }
    else if (this._filterDropdownService.catagoryList === 'ProgramName') {
      this._filterDropdownService.selectedFilterOptions.ProgramName = this._filterDropdownService.selectedItems;
    }
  }
  onDeSelectAll(items: any) {
    //if (this._fileInfoService.filtersFromDisputedCalls === false) {
      if (this._filterDropdownService.catagoryList === 'AgentName') {
        this._filterDropdownService.selectedFilterOptions.AgentName = this._filterDropdownService.selectedItems = [];
        this._fileInfoService.finalSelectedList.AgentName = null;
      }
      else if (this._filterDropdownService.catagoryList === 'CustomerAccountNo') {
        this._filterDropdownService.selectedFilterOptions.CustomerAccountNo = this._filterDropdownService.selectedItems = [];
        this._fileInfoService.finalSelectedList.CustomerAccountNo = null;
      }
      else if (this._filterDropdownService.catagoryList === 'CustomerPhoneNo') {
        this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo = this._filterDropdownService.selectedItems = [];
        this._fileInfoService.finalSelectedList.CustomerPhoneNo = null;
      }
      else if (this._filterDropdownService.catagoryList === 'ProgramName') {
        this._filterDropdownService.selectedFilterOptions.ProgramName = this._filterDropdownService.selectedItems = [];
        this._fileInfoService.finalSelectedList.ProgramName = null;
      }
      return;
    
  }
  OnItemDeSelect(item: any) {
    if (this._filterDropdownService.catagoryList === 'AgentName') {
      this._filterDropdownService.selectedFilterOptions.AgentName = this._filterDropdownService.selectedItems;
    }
    else if (this._filterDropdownService.catagoryList === 'CustomerAccountNo') {
      this._filterDropdownService.selectedFilterOptions.CustomerAccountNo = this._filterDropdownService.selectedItems;
    }
    else if (this._filterDropdownService.catagoryList === 'CustomerPhoneNo') {
      this._filterDropdownService.selectedFilterOptions.CustomerPhoneNo = this._filterDropdownService.selectedItems ;
    }
    else if (this._filterDropdownService.catagoryList === 'ProgramName') {
      this._filterDropdownService.selectedFilterOptions.ProgramName = this._filterDropdownService.selectedItems;
    }
  }

  ngOnDestroy() {
   // this._filterDropdownService.filterDropdownSelection_agent.unsubscribe();
  }
}
