var remoteVideo
var localVideo

/**
 * @type {RTCPeerConnection}
 */
var rtc


var localSDP
var localICECandidates = []

const config = {
    iceServers: [
        {
            urls: 'stun:stun.voipbuster.com:3478',
            username: "",
            credential: ""
        },
    ],
    iceTransportPolicy: 'all',
}

window.onload = async () => {
    remoteVideo = document.querySelector('#remoteVideo');
    localVideo = document.querySelector('#localVideo');

    try {
        rtc = new RTCPeerConnection(config);

        rtc.onicecandidate = async (e) => {
            if (e.candidate) {
                localICECandidates.push(e.candidate)
            }
        };

        rtc.onicegatheringstatechange = (e) => {
            console.log('rtc: icegatheringstatechange', e);
        };
        rtc.onicecandidateerror = (e) => {
            console.error('rtc candidate error', e);
        };

        const localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
            },
            // audio: true,
        });


        localVideo.srcObject = localStream;
        localStream.getTracks().forEach((track) => rtc.addTrack(track, localStream));

        rtc.addEventListener("track", (event) => {
            remoteVideo.srcObject = event.streams[0];
        });



    } catch (error) {
        console.error('rtc error', error);
    }
};


async function createOffer() {
    const offer = await rtc.createOffer()
    localSDP = offer

    rtc.setLocalDescription(localSDP);

}

async function createAnswer() {
    const remoteInfo = JSON.parse(document.querySelector('#remoteInfo').value)

    rtc.setRemoteDescription(remoteInfo.sdp)

    remoteInfo.iceCandidates.forEach(candidate => {
        rtc.addIceCandidate(candidate)
    });


    const answer = await rtc.createAnswer()
    localSDP = answer
    rtc.setLocalDescription(localSDP);

}

function writeClipboard() {
    const info = {
        sdp: localSDP,
        iceCandidates: localICECandidates,
    }

    navigator.clipboard.writeText(JSON.stringify(info));
}

async function setRemote() {
    const remoteInfo = JSON.parse(document.querySelector('#remoteInfo').value)
    rtc.setRemoteDescription(remoteInfo.sdp)

    remoteInfo.iceCandidates.forEach(candidate => {
        rtc.addIceCandidate(candidate)
    });



}

