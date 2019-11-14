import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuardService } from './shared/auth-guard.service';

import { ProfileComponent } from './components/profile/profile.component';
import { QuestionaryComponent } from './components/settings/questionary/questionary.component';
import { RedAlertsComponent } from './components/red-alerts/red-alerts.component';
import { CustomerSatisfactionComponent } from './components/customer-satisfaction/customer-satisfaction.component';
import {AgentPerformanceComponent} from './components/agent-performance/agent-performance.component';
import {CallTranscriptsComponent} from './components/call-transcripts/call-transcripts.component';
import {CallIngestionComponent} from './components/call-ingestion/call-ingestion.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import { CallRecordingsComponent } from './components/call-recordings/call-recording.component';
import { AgentPerformanceReportComponent } from './components/agent-performance-report/agent-performance-report.component';
import { Report1Component } from './components/report1/report1.component';
import { Report2Component } from './components/report2/report2.component';
import { Report3Component } from './components/report3/report3.component';
import { Report4Component } from './components/report4/report4.component';
import { Report5Component } from './components/report5/report5.component';
import { DashboardMainComponent } from './components/dashboard-main/dashboard-main.component';
import { ViewTranscriptComponent } from './components/call-transcripts/view-transcript/view-transcript.component';
import { LiveAudioComponent } from './components/live-audio/live-audio.component';
import { DisputeCallsComponent } from './components/dispute-calls/dispute-calls.component';


// @ts-ignore
const routes: Routes = [
  { path: '',  redirectTo: '/',  pathMatch: 'full'},
  { path: '', component: LandingPageComponent },
  { path: 'dashboard', component: DashboardComponent , canActivate: [AuthGuardService],
     children: [
         {
           path: 'profile',
           component: ProfileComponent,
           canActivate: [AuthGuardService]
       },
       {
         path: 'scoringEngine',
         component: QuestionaryComponent,
         canActivate: [AuthGuardService]
       },
         {
           path: 'customerSatisfaction',
           component: CustomerSatisfactionComponent,
           canActivate: [AuthGuardService]
       },

         {
           path: 'liveassistance',
           component: LiveAudioComponent,
           canActivate: [AuthGuardService]
         },
       
        {
          path: 'redAlerts',
          component: RedAlertsComponent,
          canActivate: [AuthGuardService]
        },
       {
         path: 'callUpload',
         component: CallIngestionComponent,
         canActivate: [AuthGuardService]
       },
       {
         path: 'callRecordings',
         component: CallRecordingsComponent,
         canActivate: [AuthGuardService]
       },
       {
         path: 'callTranscripts',
         component: CallTranscriptsComponent,
         canActivate: [AuthGuardService]
       },
       {
         path: 'agentPerformance',
         component: AgentPerformanceComponent,
         canActivate: [AuthGuardService]
       },
       {
         path: 'disputedCalls',
         component: DisputeCallsComponent,
         canActivate: [AuthGuardService]
       },
       {
         path: 'AvgScorebyAgent',
         component: Report1Component,
         canActivate: [AuthGuardService]
       },
       {
         path: 'AvgScorebyTarget',
         component: Report2Component,
         canActivate: [AuthGuardService]
       },
       {
         path: 'AvgScorebyQuestions',
         component: Report3Component,
         canActivate: [AuthGuardService]
       },
       {
         path: 'AvgScorebyCategory',
         component: Report4Component,
         canActivate: [AuthGuardService]
       },
       {
         path: 'ToneEmotionsbyCall',
         component: Report5Component,
         canActivate: [AuthGuardService]
       },       
       {
         path: 'ExploreCall',
         component: ViewTranscriptComponent,
         canActivate: [AuthGuardService]
       },
       {
         path: 'DashboardMain',
         component: DashboardMainComponent,
         canActivate: [AuthGuardService]
       },
       {
         path: '',
         redirectTo: 'callUpload',
         pathMatch: 'full',
         canActivate: [AuthGuardService],
       },

     ]
   },
   { path: '**',
     component: NotFoundComponent
   }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true})
  ],
})
export class AppRoutingModule {

}
