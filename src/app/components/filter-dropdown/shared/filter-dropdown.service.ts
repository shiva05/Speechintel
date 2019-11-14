import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class FilterDropdownService {
 
  public filterDropdownSelection_agent = new Subject<any>();
 
  constructor() { }
  selectedItems = [];
  selectedFilterItems = {
    AgentName: [],
    CustomerPhoneNo: [],
    CustomerAccountNo: [],
    ProgramName : []
  }
  dropdownSettings = {};
  catagoryList = '';
  filterPlaceHolder = '';
  categoryName = '';
  dropdownList = [];
  dataSet: boolean;
  customerFilterOptions = {
    AgentNames: [],
    customerPhoneNumbers: [],
    customerAccountNumbers: [],
    ProgramName: [],
    DisputeStatus: [],
    FinalStatus: [],
    IsAgentNameSelected: false,
    IsCustomerAccountSelected: false,
    IsCustomerPhoneSelected: false,
    IsProgramNameSelected: false,
    IsDisputeStatus: false,
    IsFinalStatus: false
  };

  selectedFilterOptions = {
    AgentName: [],
    CustomerPhoneNo: [],
    CustomerAccountNo: [],
    ProgramName: [],
    DisputeStatus: [],
    FinalStatus: []
  };

  ngOnInit() {
  
  }
}
