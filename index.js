let client = AgoraRTC.createClient({mode:'rtc',codec:"vp8"})

let config ={
appid:null,
token:null,
uid:null,
channel:null
} 

let localTracks={
    audioTrack:null,
    videoTrack:null,
}
let localTrackState={
    audioTrackMuted:false,
    videoTrackMuted:false,
}
let remoteTracks={

}

document.getElementById('join-btn').addEventListener('click',async()=>{
    console.log('User Joined Stream')
    await joinStreams()
    document.getElementById('join-btn').style.display='none'
    document.getElementById('footer').style.display='flex'
})
document.getElementById('mic-btn').addEventListener('click',async()=>{
    if(!localTrackState.audioTrackMuted){
        await localTracks.audioTrack.setMuted(true)
        localTrackState.audioTrackMuted=true 
        document.getElementById('mic-btn').style.backgroundColor='rgb(255,80,80,0.7)'
    }else{
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted=false
        document.getElementById('mic-btn').style.backgroundColor='#1f1f1f8e'
    }
})
document.getElementById('camera-btn').addEventListener('click',async()=>{
    if(!localTrackState.videoTrackMuted){
        await localTracks.videoTrack.setMuted(true);
        localTrackState.videoTrackMuted=true
        document.getElementById('camera-btn').style.backgroundColor='rgb(255,80,80,0.7)' 
    }else{
        await localTracks.videoTrack.setMuted(false);
        localTrackState.videoTrackMuted=false
        document.getElementById('camera-btn').style.backgroundColor='#1f1f1f8e'
    }
})
document.getElementById('leave-btn').addEventListener('click',async()=>{
    for(trackName in localTracks){
        let track= localTracks[trackName]
        if(track){
            track.stop()

            track.close()
            localTracks[trackName]=null
        }
    }
    await client.leave()
    document.getElementById('user-streams').innerHTML=''
    document.getElementById('footer').style.display='none'
    document.getElementById('join-btn').style.display='block '
})

let joinStreams= async()=>{
    client.on("user-published", handleUserJoined);
    client.on("user-left",handleUserLeft);

[config.uid,localTracks.audioTrack,localTracks.videoTrack]= await Promise.all([
    client.join(config.appid, config.channel, config.token||null,config.uid||null),
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack(),

])
let player=`<div class="video-containers" id="video-wrapper-${config.uid}">
        <p class="user-uid">${config.uid}</p>
        <div class="video-player player" id="stream-${config.uid}"></div>
</div>`
document.getElementById('user-streams').insertAdjacentHTML('beforeend',player)
localTracks.videoTrack.play(`stream-${config.uid}`)
await client.publish([localTracks.audioTrack,localTracks.videoTrack])

}
let handleUserLeft= async()=>{
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`)
    
}

let handleUserJoined= async(user, mediaType)=>{
    console.log('User has join our streaam')
remoteTracks[user.uid]=user

await client.subscribe(user,mediaType)


let player=document.getElementById(`video-wrapper-${user.uid}`)
if(player!=null){
   player.remove()
}

if(mediaType==='video')
{
    let player=`<div class="video-containers" id="video-wrapper-${user.uid}">
        <p class="user-uid">${user.uid}</p>
        <div class="video-player player" id="stream-${user.uid}"></div>
</div>`
document.getElementById('user-streams').insertAdjacentHTML('beforeend',player)
user.videoTrack.play(`stream-${user.uid}`)
}

if(mediaType==='audio'){
    user.audioTrack.play()
}

}
