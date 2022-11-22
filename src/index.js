import React, {
  useCallback,
  useEffect, useMemo, useRef,
  useState
} from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { Marker, Region, WaveForm, WaveSurfer } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
import MarkersPlugin from "wavesurfer.js/src/plugin/markers";
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
  const [rate,setRate] = useState(1);
  const [timelineVis, setTimelineVis] = useState(true);

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
      },
      onOver:()=> {console.log("MouseOver")},
      onLeave:()=> {console.log("Leaved")},
      onClick:()=> {console.log("clicked")},
      onDoubleClick:()=> {console.log("doubleclicked")},
      onIn:()=> {console.log("playback in")},
      onOut:()=> {console.log("playback out")},
      onUpdate:()=> {console.log("update")},
      onUpdateEnd:()=> {console.log("update end")},
      onRemove:()=> {console.log("remove")}

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

  const wavesurferRef = useRef();
  const handleWSMount = useCallback(
    (waveSurfer) => {
      if (waveSurfer.markers) {
        waveSurfer.clearMarkers();
      }

      wavesurferRef.current = waveSurfer;

      if (wavesurferRef.current) {
        wavesurferRef.current.load("/bensound-ukulele.mp3");

        wavesurferRef.current.on("region-created", regionCreatedHandler);

        wavesurferRef.current.on("ready", () => {
          console.log("WaveSurfer is ready");
        });

        wavesurferRef.current.on('play',()=>{
          console.log("Play starts now");
        }); /// ...............it is an event which trigger's when audio is played..................///
        wavesurferRef.current.on('finish',()=>{
          alert("Audio Playing ended now ");
        }); /// ...............it is an event which trigger's when audio is ended..................///

        wavesurferRef.current.on("region-removed", (region) => {
          console.log("region-removed --> ", region);
        });

        wavesurferRef.current.on("loading", (data) => {
          console.log("loading --> ", data);
        });
       // wavesurferRef.current.setWaveColor("Blue");
        wavesurferRef.current.setProgressColor("Blue");

        if (window) {
          window.surferidze = wavesurferRef.current;
        }
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
    console.log(" start : "+ start +" end : "+end); /// this was done when I couldn't play a certain region. so I grabed the start and end time and then passed to play method
    console.log(typeof(start),typeof(end));
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
  const removeFirstRegion = useCallback(()=>{
    let nextRegions = [...regions];
    nextRegions.shift();
    setRegions(nextRegions);

  },[regions]);
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

      }

    });
    console.log("This is smth "+smth);
  }, []);
  const handleChange =((event)=>{
    setRate(event.target.value);
  });
  const handleSubmit = ((event)=>{
    event.preventDefault();
    console.log("Before :" + wavesurferRef.current.getCurrentTime());
    let CurrentTime = wavesurferRef.current.getCurrentTime();
    wavesurferRef.current.setPlaybackRate(rate);
    wavesurferRef.current.play(CurrentTime);/// ...... Rate ta change hole, current time e increased rate e (or decreased rate e) jekhane thaka uchit sekhane chole jai,
    ///................ Tai currrent time ta niye , sei time theke play start kora lage...........................
    console.log("After :" + wavesurferRef.current.getCurrentTime());


  })
  const skipForward = (()=>{
    wavesurferRef.current.skipForward();
  });
  const handlePlayRegion  =((event)=>{
    alert("In play region");
    regions.map((region)=>{
      if(region.id === event.target.value){
        wavesurferRef.current.regions.list[region.id],play();
      }

    });


  });
  return (
    <div className="App">
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
        </WaveForm>
        <div id="timeline" />
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

      <form onSubmit={handleSubmit}>
        <label>
          PlayBack Speed :
          <select value={rate} onChange={handleChange}>
          <option value="2">2</option>
          <option value="1.75">1.75</option>
          <option value="1.5">1.5</option>
          <option value="1.25">1.25</option>
          <option value="1">1</option>
          <option value="0.75">0.75</option>
          <option value="0.5">0.5</option>
          <option value="0.25">0.25</option>
          </select>
        </label>
        <input type="submit" value="Submit" />
      </form>
      <label>
          Select Which region you want to play
      </label>
        
      <select value="3" onChange = {handlePlayRegion} >
        {regions.map((region)=>{
          <option value= {region.id} >{region.id}</option>
          alert(region.id);
        })}
      </select>
          
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
