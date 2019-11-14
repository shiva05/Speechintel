import { Component, OnInit } from '@angular/core';
import { clearInterval } from 'timers';

@Component({
  selector: 'app-live-audio',
  templateUrl: './live-audio.component.html',
  styleUrls: ['./live-audio.component.css']
})
export class LiveAudioComponent implements OnInit {
  showChatbox = false;
  questions = [];
  instructions = [];
  inter: any;
  constructor() { }
  ngOnInit() {
    this.questions = [
      {
        "Question": " Call Start",
        "Success": false,
        "background": "#1d8426"
      },
      {
        "Question": "Did the Client Success Representative verify the Client's i) First and Last Name ii) Last four of SSN",
        "Success": false,
        "background": "#dc2223"
      },
      {
        "Question": " Did the Client Success Representative collect and validate the current location of the debt (3rd Party Information)?",
        "Success": false,
        "background": "#dc2223"
      },
      {
        "Question": "  Did the Client Success Representative review Client's drafting history?",
        "Success": false,
        "background": "#1d8426"
      },
      {
        "Question": " Did the Client Success Representative promote/present the benefit of the Client Portal?",
        "Success": false,
        "background": "#1d8426"
      }

    ]
  }

  showChat() {
    this.showChatbox = true;
    this.instructions = [];
    this.instructions.push(this.questions[0]);
    let count = 0;
    this.inter = setInterval(() => {
      if (count < 4) {
        this.instructions.push(this.questions[count + 1]);
        count = count + 1; 
      }
         
    }, 4000);
  
  
   
  }
  closeChat() {
    this.showChatbox = false;
    clearInterval(this.inter);
  }

}
