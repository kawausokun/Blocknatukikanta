"use strict";

class Rectangle{
    constructor(x,y,width,height){
        this.mWidth=width;
        this.mHeight=height;
    }

    contains(x,y){
        return(this.mX<=x && x<this.mX+this.mWidth
            &&this.mY<=y && this.mY<this.mY+this.mHeight);
    }

    //中央座標に関するプロパティ
    get pCX(){
        return(this.mX+this.mWidth/2);
    }
    set pCX(value){
        this.mX=value-this.mWidth/2;
    }
    get pCY(){
        return(this.mY+this.mHeight/2);
    }
    set pCY(value){
        this.mY=value-this.mHeight/2;
    }
}

const WIDTH=720;
const HEIGHT=540;
const MESH=24;
const MAG=3;
const ROW=8;
const COLUMN=14;
//赤、マゼンダ、緑、黄
var PALETTE=
    ["#ff0000","#ff00ff","#00ff00","#ffff00"];

//ブロックが破壊されたかどうかの情報を保持する配列
var gBreak=[];
var gScore=0;
var gLife=10;
var gWait;

class Ball extends Rectangle{

    constructor(){
        super(0,0,MAG*4,MAG*4);
               
    }
    draw(g){
        g.fillStyle="#ffffff";
        g.fillRect(this.mX,this.mY,this.mWidth,this.mHeight);
    }

    move(){
        this.mX+=this.mDX;
        this.mY+=this.mDY;
        //プレイヤーとのあたり判定
        if(gPlayer.contains(this.mX,this.mY)){
            //反射角度を取得、aはラジアン。2パイ
            let a=Math.atan2(this.pCY-gPlayer.pCY,this.pCX-gPlayer.pCX);
            this.mDX=Math.cos(a);
            this.mDY=Math.sin(a);
            this.mDY=Math.min(this.mDY,-0.25);
            //以下はラケットへの埋没防止
            this.mY+=this.mDY;

            //this.mDY=-this.mDY;
            this.mSpeed++;
        }
        //14*8のブロック座標の取得、mesh24
        let x=Math.floor((this.pCX-MESH)/(MESH*2));
        let y=Math.floor((this.pCY-MESH*3)/MESH);
        //console.log("x="+x+",  y="+y);
        //ボールがブロックの範囲内かどうかを判定
        if(x>=0 && x<COLUMN && y>=0 &&y<ROW){
            let i=y*COLUMN+x;
            //ブロックが壊されていなかったら
            if(!gBreak[i]){
            //ブロックを壊す→次は描画を変更
                gBreak[i]=1;
                gScore++;
            }
        }


        //外枠とのあたり判定
        if(this.pCX<MESH||this.pCX>WIDTH-MESH){
            this.mDX=-this.mDX;
        }
        if(this.pCY<MESH){
            this.mDY=-this.mDY;
        }
    }
    start(){
        this.pCX=WIDTH/2;
        this.pCY=MESH*12;
        this.mDX=Math.random()/5-0.1;
        this.mDY=1;
        this.mSpeed=32;
    }
    tick(){
        //スピードを従来の8倍に。
        for(let i=0;i<this.mSpeed/4;i++){
            this.move();
        }
        if(this.mY>HEIGHT){
            gLife--;
            if(gLife==0){
                return;
            }
            start();
        }
    }
}
var gBall=new Ball();

class Player extends Rectangle{

    constructor(){
        super(0,0,MESH*2,MESH);
    }

    draw(g){
        //プレイヤー、自機
        //g.fillStyle="#00ffff";
        DrawBlock(g,this.mX,this.mY,"#00ffff");
        //g.fillRect(this.mX,this.mY,MESH,MESH);
    }
    start(){
        this.pCX=WIDTH/2;
        this.pCY=HEIGHT-MESH*2;

        //this.pCX=WIDTH/2-MAG*2;
        //this.pCY=HEIGHT-MESH*3-MAG*2;
    }
    tick(){
        //左右のみ動ける
        this.mX=Math.max(MESH,this.mX-gKey[37]*MAG*5);
        this.mX=Math.min(WIDTH-MESH*2,this.mX+gKey[39]*MAG*5);
        this.mY=Math.max(MESH,this.mY-gKey[38]*MAG*5);
        this.mY=Math.min(HEIGHT-MESH*2,this.mY+gKey[40]*MAG*5);

    }
}

var gPlayer=new Player();

function DrawBlock(g,x,y,style){
    g.fillStyle=style;
    g.fillRect(x+MAG,y+MAG,MESH*2-MAG*2,MESH-MAG*2);  
}

function draw(){
    //ブラウザ要素をロード、描画コンテキストを変数に
    let g=document.getElementById("block")
    .getContext("2d");
   //外枠白
    g.fillStyle="#ffffff";
    g.fillRect(0,0,WIDTH,HEIGHT);
    //内枠黒
    g.fillStyle="#000000";
    g.fillRect(MESH-MAG,MESH-MAG,WIDTH-MESH*2+MAG*2,HEIGHT-MESH+MAG*2);
    //矩形ブロックの描画
    for(let y=0;y<ROW;y++){
        for(let x=0;x<COLUMN;x++){
            //y>>1はyを2で割る
            //ブロックが壊されていなければ描画する
            if(!gBreak[y*COLUMN+x]){
            DrawBlock(g,MESH*(x*2+1),(y+3)*MESH,PALETTE[y>>1]);  
            }
        }
    }

    gPlayer.draw(g);

    g.font="36px monospace";
    g.fillStyle="#ffffff";
    // g.fillText("suitekikun",100,100);
     g.fillText("SCORE"+gScore,MESH*2,MESH*2.5);
     g.fillText("LIFE"+gLife,MESH*23,MESH*2.5);
 
     if(gLife<=0){
         g.fillText("Game Over",WIDTH/2-MESH*3,HEIGHT/2+MESH*4);
     }
     if(gScore==COLUMN*ROW){
        g.fillText("Game Clear",WIDTH/2-MESH*3,HEIGHT/2+MESH*4);
    }
     gBall.draw(g);
    
}

function start(){
    //ゲーム再開までの待ち時間、1秒
    gWait=60;
   gPlayer.start();
   gBall.start();

}
function tick(){
    if(gLife==0){
        return;
    }
    //ゲームクリア
    if(gScore==COLUMN*ROW){
        return;
    }
    //プレイヤーの動き
    gPlayer.tick();
    if(gWait){
        gWait--;
        return;
    }
    
    //gBall.tick();
    gBall.tick();

}
//=============sakegame-yori===============================
const TIMER_INTERVAL=33;
var gKey=new Uint8Array(0x100);
var gTimer;


//描画イベント
function onPaint(){
    //console.log("onPaint"+gTimer);
   if(!gTimer){
    gTimer=performance.now();
   }
if(gTimer+TIMER_INTERVAL<performance.now()){
    gTimer+=TIMER_INTERVAL;
    tick();
    draw();
}
    requestAnimationFrame(onPaint);
}
//キーを押したときのイベント
window.onkeydown=function(ev){
 //   console.log("dn ev.keyCode="+ev.keyCode);
    gKey[ev.keyCode]=1;
  //   console.log("gX="+gX);
}
//キーを離した時のイベント
window.onkeyup=function(ev){
    gKey[ev.keyCode]=0;
//    console.log("up ev.keyCode="+ev.keyCode);
}

//ブラウザを起動 起動時のイベント
window.onload=function(){

    start();
    requestAnimationFrame(onPaint);
    //onPaint();
    //draw();
    
}