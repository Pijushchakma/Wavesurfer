import React, {
  useCallback,
  useEffect, useMemo, useRef,
  useState
} from "react";
// import Dropdown from 'react-bootstrap/Dropdown';
// import SplitButton from 'react-bootstrap/SplitButton';
import ReactDOM, { flushSync } from "react-dom";
import styled from "styled-components";
import { Marker, Region, WaveForm, WaveSurfer } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
import MarkersPlugin from "wavesurfer.js/src/plugin/markers";
import '../node_modules/font-awesome/css/font-awesome.min.css';
// import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles.css";
const Buttons = styled.div`
  display: inline-block;
`;

const Button = styled.button``;

/**
 * @param min
 * @param max
 * @returns {*}
 */
function generateNum(min, max) {
  return Math.random() * (max - min + 1) + min;
}

/**
 * @param distance
 * @param min
 * @param max
 * @returns {([*, *]|[*, *])|*[]}
 */
function generateTwoNumsWithDistance(distance, min, max) {
  const num1 = generateNum(min, max);
  const num2 = generateNum(min, max);
  // if num2 - num1 < 10
  if (num2 - num1 >= 10) {
    return [num1, num2];
  }
  return generateTwoNumsWithDistance(distance, min, max);
}
function App() {
  
  const [textboxes,setTextboxes] = useState([]);
  const [rate,setRate] = useState(1);
  const [timelineVis, setTimelineVis] = useState(true);
  const [volume,setVolume] = useState(1);
  const [zoom,setZoom] = useState(1);
  
  useEffect(()=>{
    //alert("Called");
    regions.forEach(region =>{
      let option = document.createElement('option')
      option.value = region.id
      option.text = region.id
      document.getElementById('regions').appendChild(option)
    })
    
  },[regions]);
  useEffect(()=>{
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    const duration = wavesurferRef.current.getDuration();
    textboxes.forEach(text =>{
      //alert(text.id);
      const textID = ''.concat(text.id,'text');
      const element = document.getElementById(textID);
      if(element){/// Jodi er age kono element ei ID te create hoy then remove it first then create it again
       // console.log("I am here");
        element.remove();
      }
      let textbox = document.createElement('input');
      textbox.type = "text";
      textbox.id = textID;
      console.log(typeof(textbox.id));
      const textStart = (w/duration)*text.start;
      const textEnd = (w/duration)*text.end;
      const startPosition = textStart+9;
      const diff =  textEnd- textStart;
      const endPosition = startPosition+diff;
      document.body.appendChild(textbox);
      document.getElementById(textID).style.position = "absolute";
      document.getElementById(textID).style.width = `${diff}px`;
      document.getElementById(textID).style.left = `${startPosition}px`;;

      // for creating a new div
      
      const divName = ''.concat(text.id,'-div');
      // this checks whether a div with same id is already there or not. 
      // If there is any then it deletes it first , then create a div with same id in different location
      // this feature is useful for dragging the regions'
      // when we drag a region , text box and button also gets drag
      if(document.getElementById(divName)){
        document.getElementById(divName).remove();
      }
      const myDiv = document.createElement('div');
     
      myDiv.className = "dropup";
      myDiv.id = divName;
      document.body.appendChild(myDiv);

     const myButton =  document.createElement('button');
     const  buttonName = ''.concat(text.id,'button');
     myButton.id = buttonName;
     myButton.className = "dropbtn";
     document.getElementById(divName).appendChild(myButton);
     document.getElementById(divName).style.position = "absolute";
     document.getElementById(divName).style.left = `${endPosition}px`;
     document.getElementById(buttonName).style.position = "absolute";
     document.getElementById(buttonName).style.borderLeft = "1px solid #0d8bf2";

     // This is for the Up arrow 
     const newIcon = document.createElement('i');
     newIcon.className = "fa fa-caret-up";
     document.getElementById(buttonName).appendChild(newIcon);


/// this is the div which takes the options
     const innerDiv = document.createElement('div');
     const innerDivName = ''.concat(text.id,'-inner-div');
     innerDiv.className = "dropup-content";
     innerDiv.id = innerDivName;
     document.getElementById(divName).appendChild(innerDiv);

/// This part is for options in drop-up. There  only option is created.
     const options = document.createElement('a');
     options.href = "#";
     options.innerHTML = "Link 1 ";
     document.getElementById(innerDivName).appendChild(options);

    })
  },[textboxes]);
  // useEffect(()=>{
  //   alert("Just checking the window size :"+ window.innerWidth);
  // },[window.innerWidth]);
  function printMousePos(event) {
    console.log(event.clientX);
    // document.body.textContent =
    //   "clientX: " + event.clientX +
    //   " - clientY: " + event.clientY;
  }
  
  document.addEventListener("click", printMousePos);
  useEffect(()=>{
    wavesurferRef.current.setVolume(volume);

  },[volume]);

  useEffect(()=>{
    wavesurferRef.current.zoom(zoom);

  },[zoom]);
  useEffect(()=>{
    let CurrentTime = wavesurferRef.current.getCurrentTime();
    //wavesurferRef.current.setPlaybackRate(rate);
    //wavesurferRef.current.play(CurrentTime);
    wavesurferRef.current.setPlaybackRate(rate);
    wavesurferRef.current.play(CurrentTime);
  },[rate]);
  

  const [markers, setMarkers] = useState([
    {
      time: 5.5,
      label: "V1",
      color: "#ff990a",
      draggable: true
    },
    {
      time: 10,
      label: "V2",
      color: "#00ffcc",
      position: "top"
    }
  ]);

  const plugins = useMemo(() => {
    return [
      {
        plugin: RegionsPlugin,
        options: { dragSelection: true }
      },
      timelineVis && {
        plugin: TimelinePlugin,
        options: {
          container: "#timeline"
        }
      },
      {
        plugin: MarkersPlugin,
        options: {
          markers: [{ draggable: true }]
        }
      }
    ].filter(Boolean);
  }, [timelineVis]);

  const toggleTimeline = useCallback(() => {
    setTimelineVis(!timelineVis);
  }, [timelineVis]);

  const [regions, setRegions] = useState([
    {
      id: "region-1",
      start: 0.5,
      end: 10,
      //loop:true,
      color: "rgba(0, 0, 0, .5)",
      data: {
        systemRegionId: 31
      }
     
      // onOver:()=> {console.log("MouseOver")},
      // onLeave:()=> {console.log("Leaved")},
      // onClick:()=> {console.log("clicked")},
      // onDoubleClick:()=> {console.log("doubleclicked")},
      // onIn:()=> {console.log("playback in")},
      // onOut:()=> {console.log("playback out")},
      // onUpdate:()=> {console.log("update")},
      // onUpdateEnd:()=> {console.log("update end")},
      // onRemove:()=> {console.log("remove")}

      //play:()=>{wavesurferRef.current.regions.list["region-1"].play()}
    },
    {
      id: "region-2",
      start: 15,
      end: 25,
      color: "rgba(225, 195, 100, .5)",
      data: {
        systemRegionId: 32
      }
     // play:()=>{wavesurferRef.current.regions.list["region-2"].play()}
    },
    {
      id: "region-3",
      start: 35,
      end: 55,
      color: "rgba(25, 95, 195, .5)",
      data: {
        systemRegionId: 33
      }
      //play:()=>{wavesurferRef.current.regions.list["region-3"].play()}
    }
  ]);
 


  // use regions ref to pass it inside useCallback
  // so it will use always the most fresh version of regions list
  const regionsRef = useRef(regions);

  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);
 // const forUndoBuffer = wavesurferRef.current.backend.buffer;
  const regionCreatedHandler = useCallback(
    (region) => {
      console.log("region-created --> region:", region);

      if (region.data.systemRegionId) return;

      setRegions([
        ...regionsRef.current,
        { ...region, data: { ...region.data, systemRegionId: -1 } }
      ]);
    },
    [regionsRef]
  );
 const doubleClickHandle = ((region)=>{
  flushSync(() => {
    setTextboxes([...textboxes,{"start" : region.start, "end" : region.end, "id" : region.id}]);
  });

 });
  const  adjustTextBoxAfterRegionRemoved =(region)=>{
    const textID = ''.concat(region.id,'text');
    const element = document.getElementById(textID);
    if(element){
      element.remove();
    }
   const divName = ''.concat(region.id,'-div');
    if(document.getElementById(divName)){
      document.getElementById(divName).remove();
    }
 };
  const wavesurferRef = useRef();
  const handleWSMount = useCallback(
    (waveSurfer) => {
      if (waveSurfer.markers) {
        waveSurfer.clearMarkers();
      }

      wavesurferRef.current = waveSurfer;

      if (wavesurferRef.current) {
        wavesurferRef.current.load("/Dua_Lipa_Levitating.mp3");
        //wavesurferRef.current.load("/Jung_Kook_feat_BTS_-_Dreamer_FIFA_World_Cup_2022__VistaNaija.Com.mp3");

        wavesurferRef.current.on("region-created", regionCreatedHandler);

        wavesurferRef.current.on("ready", () => {
          console.log("WaveSurfer is ready");
        });

        wavesurferRef.current.on('play',()=>{
          console.log("Play starts now");
        }); /// ...............it is an event which trigger's when audio is played..................///
        wavesurferRef.current.on('finish',()=>{
         // alert("Audio Playing ended now ");
        }); /// ...............it is an event which trigger's when audio is ended..................///

        wavesurferRef.current.on("region-removed", (region) => {
          console.log("region-removed --> ", region);
          adjustTextBoxAfterRegionRemoved(region);
        });

        wavesurferRef.current.on("loading", (data) => {
          console.log("loading --> ", data);
        });
        wavesurferRef.current.on("region-dblclick", (region)=> {
          //alert("I am clicked man!");
          //e.stopPropagation()
          console.log("textbox", textboxes);
          doubleClickHandle(region);
          
          
        });
       // wavesurferRef.current.setWaveColor("Blue");
        wavesurferRef.current.setProgressColor("Blue");

        if (window) {
          window.surferidze = wavesurferRef.current;
        }
        wavesurferRef.current.setHeight(300);
      }
    },
    [regionCreatedHandler]
  );

  const generateRegion = useCallback(() => {
    if (!wavesurferRef.current) return;
    const minTimestampInSeconds = 0;
    const maxTimestampInSeconds = wavesurferRef.current.getDuration();
    const distance = generateNum(0, 10);
    const [min, max] = generateTwoNumsWithDistance(
      distance,
      minTimestampInSeconds,
      maxTimestampInSeconds
    );

    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    setRegions([
      ...regions,
      {
        id: `custom-${generateNum(0, 9999)}`,
        start: min,
        end: max,
        color: `rgba(${r}, ${g}, ${b}, 0.5)`
        //play:()=>{wavesurferRef.current.regions.list[id].play()}
      }
    ]);
  }, [regions, wavesurferRef]);
  const generateMarker = useCallback(() => {
    if (!wavesurferRef.current) return;
    const minTimestampInSeconds = 0;
    const maxTimestampInSeconds = wavesurferRef.current.getDuration();
    const distance = generateNum(0, 10);
    const [min] = generateTwoNumsWithDistance(
      distance,
      minTimestampInSeconds,
      maxTimestampInSeconds
    );

    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    setMarkers([
      ...markers,
      {
        label: `custom-${generateNum(0, 9999)}`,
        time: min,
        color: `rgba(${r}, ${g}, ${b}, 0.5)`
      }
    ]);
  }, [markers, wavesurferRef]);
  const playFirstRegion = useCallback(()=>{ // playing the first region. it can be made dynamic simply by accepting props
    let start, end;
    start =regions[0].start;
    end = regions[0].end;
   // console.log(" start : "+ start +" end : "+end); /// this was done when I couldn't play a certain region. so I grabed the start and end time and then passed to play method
    //console.log(typeof(start),typeof(end));
    wavesurferRef.current.regions.list[regions[0].id].play()
  },[regions]);
  const playFromStart = (()=>{
    wavesurferRef.current.play(0);
  });
  const playLoop = useCallback(()=>{
    //alert("in play loop");
    wavesurferRef.current.regions.list[regions[0].id].playLoop();
  });
  const removeLastRegion = useCallback(() => {
    let nextRegions = [...regions];
    nextRegions.pop();
    setRegions(nextRegions);
  }, [regions]);
  const removeFirstRegion = (()=>{
    let nextRegions = [...regions];
    console.log("before:"+nextRegions);
    nextRegions.shift();
    console.log("Regions :  "+ nextRegions);
    setRegions(nextRegions);
  });
  const removeLastMarker = useCallback(() => {
    let nextMarkers = [...markers];
    nextMarkers.pop();
    setMarkers(nextMarkers);
  }, [markers]);

  const shuffleLastMarker = useCallback(() => {
    setMarkers((prev) => {
      const next = [...prev];
      let lastIndex = next.length - 1;
      const minTimestampInSeconds = 0;
      const maxTimestampInSeconds = wavesurferRef.current.getDuration();
      const distance = generateNum(0, 10);
      const [min] = generateTwoNumsWithDistance(
        distance,
        minTimestampInSeconds,
        maxTimestampInSeconds
      );

      next[lastIndex] = {
        ...next[lastIndex],
        time: min
      };

      return next;
    });
  }, []);

  const play = useCallback(() => {
    wavesurferRef.current.playPause();
  }, []);
  
  const handleRegionUpdate = useCallback((region, smth) => {
    console.log("region-update-end --> region:", region); 
    regions.map((rg)=>{
      if(rg.id === region.id){
        rg.start = region.start, rg.end = region.end;
        //alert("In handleUpdate start :" +rg.start + "end "+rg.end);

      }
      doubleClickHandle(region);
      

    });
    console.log("This is smth "+smth);
  }, []);
  const handleChange =((event)=>{
    setRate(event.target.value);
    
  });
  const skipForward = (()=>{
    wavesurferRef.current.skipForward();
  });
  const handlePlayRegion  = ((event)=>{
    //alert("In play region");
    regions.map((region)=>{
      if(region.id === event.target.value){
        wavesurferRef.current.regions.list[region.id].play();
      }

    });
  });
  const handleZoomSlider =((event)=>{
    setZoom(event.target.value);
  });
  const handleVolumeSlider = (e) => {
		setVolume(e.target.value);
	};
  // const undoTrim = ((e)=>{
  //   alert("Here in undo"+ forUndoBuffer.length);
  //   wavesurferRef.current.loadDecodedBuffer(forUndoBuffer);

  // });
  const handleTrim = ((e)=>{
    //alert("at");
    const myRegion = regions[0];
    // alert(myRegion.id);
    const start = myRegion.start;
    const end = myRegion.end;
    //alert(start +"  :   " + end);
    const originalBuffer = wavesurferRef.current.backend.buffer;
    const myRate = originalBuffer.sampleRate;
    const firstListIndex = start * myRate;
    const secondListIndex = end *   myRate;
    const newBuffer = wavesurferRef.current.backend.ac.createBuffer(
      originalBuffer.numberOfChannels,
      (originalBuffer.length-(secondListIndex-firstListIndex)),
      originalBuffer.sampleRate
    );
    //forUndoBuffer = originalBuffer;
    if(firstListIndex === 0){ /// ...............Jodi ekdom first theke trim kore tahole....................
      const secondListMemAllocation = originalBuffer.length - secondListIndex;
      const secondList = new Float32Array(parseInt(secondListMemAllocation));
      const combined = new Float32Array(originalBuffer.length- (secondListIndex-firstListIndex));
      originalBuffer.copyFromChannel(secondList,1,secondListIndex);
      originalBuffer.copyFromChannel(secondList,0,secondListIndex);
      //combined.set(newList);
      combined.set(secondList,firstListIndex);
      newBuffer.copyToChannel(combined,1);
      newBuffer.copyToChannel(combined,0);
    //newBuffer.length = combined.length;
      wavesurferRef.current.loadDecodedBuffer(newBuffer);
      wavesurferRef.current.play();
     // alert("here");
      removeFirstRegion();

///..........Jodi ekdom last theke trim kora shuru kore. Etar accuracy kom tai second or condition ta deya ache.................
    }else if(secondListIndex == originalBuffer.length || (secondListIndex +1000) >= originalBuffer.length ){
      const newList  = new Float32Array(parseInt(firstListIndex));
      const combined = new Float32Array(originalBuffer.length- (secondListIndex-firstListIndex));
      originalBuffer.copyFromChannel(newList,1);
      originalBuffer.copyFromChannel(newList,0);
      combined.set(newList);
      //combined.set(secondList,firstListIndex);


      newBuffer.copyToChannel(combined,1);
      newBuffer.copyToChannel(combined,0);
      wavesurferRef.current.loadDecodedBuffer(newBuffer);
      wavesurferRef.current.play();
      removeFirstRegion();

    }else{
    const secondListMemAllocation = originalBuffer.length - secondListIndex;
    //alert(secondListMemAllocation);
    const newList  = new Float32Array(parseInt(firstListIndex));
    const secondList = new Float32Array(parseInt(secondListMemAllocation));
    const combined = new Float32Array(originalBuffer.length- (secondListIndex-firstListIndex));
    //alert(combined.length);
    
    
    originalBuffer.copyFromChannel(newList,1);
    originalBuffer.copyFromChannel(newList,0);

    originalBuffer.copyFromChannel(secondList,1,secondListIndex);
    originalBuffer.copyFromChannel(secondList,0,secondListIndex);

    combined.set(newList);
    combined.set(secondList,firstListIndex);


    newBuffer.copyToChannel(combined,1);
    newBuffer.copyToChannel(combined,0);
    //newBuffer.length = combined.length;
    wavesurferRef.current.loadDecodedBuffer(newBuffer);
    wavesurferRef.current.play();
    removeFirstRegion();

    }
    
    //wavesurferRef.current.playPause();
  });
  return (
    <div className="App">
      <div>
        <WaveSurfer plugins={plugins} onMount={handleWSMount}>
        <WaveForm id="waveform" cursorColor="transparent">
          {regions.map((regionProps) => (
            <Region
              onUpdateEnd={handleRegionUpdate}
              key={regionProps.id}
              {...regionProps}
            />
          ))}
          {markers.map((marker, index) => {
            return (
              <Marker
                key={index}
                {...marker}
                onClick={(...args) => {
                  console.log("onClick", ...args);
                }}
                onDrag={(...args) => {
                  console.log("onDrag", ...args);
                }}
                onDrop={(...args) => {
                  console.log("onDrop", ...args);
                }}
              />
            );
          })}
           <div>
          hello
        </div>
        </WaveForm>
        {/* <div>
          try case it is 1
        </div> */}
       
        <div id="timeline" />
        {/* <div>
          try case it is 2
        </div> */}
      </WaveSurfer>
      <Buttons>
        <Button onClick={generateRegion}>Generate region</Button>
        <Button onClick={generateMarker}>Generte Marker</Button>
        <Button onClick={play}>Play / Pause</Button>
        <Button onClick={playFirstRegion}> play first region</Button>
        <Button onClick={playLoop}> Play loop first region</Button>
        <Button onClick={removeFirstRegion}> Remove First Region </Button>
        <Button onClick={removeLastRegion}>Remove last region</Button>
        <Button onClick={removeLastMarker}>Remove last marker</Button>
        <Button onClick={shuffleLastMarker}>Shuffle last marker</Button>
        <Button onClick={toggleTimeline}>Toggle timeline</Button>
        <Button onClick={playFromStart}> Play from Start</Button>
        <Button onClick={skipForward}>Skip Forward</Button>
      </Buttons>
      <div className='volume-slide-container'>
						<i className='material-icons zoom-icon'>
							Play Back Speed  : 
						</i>
						<input
							type='range'
							min='0.25'
							max='2'
              step = '0.25'
							value={rate}
							onChange={handleChange}
							className='slider zoom-slider'
						/>
						{/* <i className='material-icons zoom-icon'>add_circle</i> */}
					</div>
      <label for="regions">
          Select Which region you want to play :
      </label>
        
      <select name = "regions" id = "regions" onChange = {handlePlayRegion} >
        {/* {
          // regions.forEach(region =>{
          //     <option value = {region.id}> {region.id}</option>
          // })


        ...(regions.map(region=>{
          <option value= {region.id}> {region.id}</option>
        }))
        } */}
        
      </select>
      <div className='volume-slide-container'>
						<i className='material-icons zoom-icon'>
							Zoom :
						</i>
						<input
							type='range'
							min='1'
							max='1000'
							value={zoom}
							onChange={handleZoomSlider}
							className='slider zoom-slider'
						/>
						{/* <i className='material-icons zoom-icon'>add_circle</i> */}
					</div>
          <div className='volume-slide-container'>
						{volume > 0 ? (
							<i className='material-icons'>volume_up  :</i>
						) : (
							<i className='material-icons'>volume_off  :</i>
						)}
						<input
							type='range'
							min='0'
							max='1'
							step='0.05'
							value={volume}
							onChange={handleVolumeSlider}
							className='slider volume-slider'
						/>
					</div>
          <Button onClick={handleTrim}> Trim </Button>
      </div>
      
         
      {/* <div class="dropup">
        <button className="dropbtn"style={{borderLeft:'1px solid #0d8bf2'}}><i className="fa fa-caret-up"></i></button>
        <div className="dropup-content">
          <a href="#">Link 1</a>
          <a href="#">Link 2</a>
          <a href="#">Link 3</a>
        </div>
      </div>
         */}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
