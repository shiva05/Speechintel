import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByDate'
})
export class SortByDatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
  //  console.log("value", value);
   // console.log("args", args);
    if ((value.length == 0 && args === 'CallDate') || (value.length == 0 && args === 'UploadedDate')){
      return value
    }
    if (args === 'CallDate') {
      let arr = value.sort((a,b) => new Date(b.CallDate).getTime() - new Date(a.CallDate).getTime());
     return arr;
    }
    else if (args === 'UploadedDate') {
      let arr = value.sort((a, b) => new Date(b.UploadedDate).getTime() - new Date(a.UploadedDate).getTime());
      return arr;
    }
    return value;
    
  }

}
