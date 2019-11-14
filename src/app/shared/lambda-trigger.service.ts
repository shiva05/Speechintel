import {Injectable} from '@angular/core';
import * as AWS from 'aws-sdk';

@Injectable()
export class LambdaTriggerService {

  lambda: any;

  constructor() {
    AWS.config.region = 'us-west-2'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'us-west-2:697a132e-a9a4-4eda-a2cf-c88cb3157023',
    });
    this.lambda = new AWS.Lambda({region: 'us-west-2', apiVersion: '2015-03-31'});
  }

  executeLambda(params: any) {
     return this.lambda.invoke(params).promise();
  }

}
