import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter'
})

export class SearchPipe implements PipeTransform {

  transform(fileInfo: any, searchText: string): any {

    // Check if array is null
    if (!fileInfo) {
      return [];
    }
    // Check if input is null
    if (!searchText) {
      return fileInfo;
    }
    return fileInfo.filter(function (item) {
      return item.FileName.toLowerCase().includes(searchText.toLowerCase());
    });
  }
}
