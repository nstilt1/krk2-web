"use client";

import Image from "next/image";
import React, { useRef, useState } from 'react';
import Selector from "./Selector";
import NumberInput from "./NumberInput";
import MultiSelect from "./MultiSelector";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import SavedChords from "./SavedChords";

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./ui/tooltip";

const Calculate = ({ 
  wasmModule, 
  showExtraControls, 
  toggleExtraControls,
  fuselages, 
  handleFuselageSelection,
  techNodes,
  handleTechNodeSelection,
  mass,
  setMass,
  targetDeltaV,
  setTargetDeltaV,
  minimumTwr,
  setMinimumTwr,
  maximumTwr,
  setMaximumTwr,
  inVacuum,
  setInVacuum,
  needsGimballing,
  setNeedsGimballing,
  useNosecone,
  setUseNosecone,
  noseHeight,
  setNoseHeight,
  diameter,
  setDiameter,
  fuselageList,
  techNodeList,
}) => {

  const [result, setResult] = useState(null);
  const [savedRocketsOpen, setSavedRocketsOpen] = useState(false);
  
  // Function to save current form settings
  const saveCurrentSettings = (name) => {
    const settingsToSave = {
      mass,
      targetDeltaV,
      minimumTwr,
      maximumTwr,
      inVacuum,
      needsGimballing,
      useNosecone,
      diameter,
      noseHeight,
    };
  
    // Use useLocalStorage to save
    const savedProgressions = JSON.parse(localStorage.getItem('savedRockets') || '{}');
    savedProgressions[name] = {
      type: 'calculated',
      contents: settingsToSave,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('savedRockets', JSON.stringify(savedProgressions));
  };

  // Function to load saved settings
  const handleLoadSettings = (settings) => {
    // Update each state variable from the loaded settings
    setMass(settings.mass);
    setTargetDeltaV(settings.targetDeltaV);
    setMinimumTwr(settings.minimumTwr);
    setMaximumTwr(settings.maximumTwr);
    setInVacuum(settings.inVacuum);
    setNeedsGimballing(settings.needsGimballing);
    setUseNosecone(settings.useNosecone);
    setDiameter(settings.diameter);
    setNoseHeight(settings.noseHieght);
  };

  const handleTextChange = (event) => {
    setTextInput(event.target.value);
  }

  const handleInVacuumChange = (event) => {
    setInVacuum(!inVacuum);
  }

  const handleNeedsGimballingChange = (event) => {
    setNeedsGimballing(!needsGimballing);
  }

  const handleUseNoseconeChange = (event) => {
    setUseNosecone(!useNosecone);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if(targetDeltaV <= 0) {
      alert("Please provide a target delta-v.");
      return;
    }

    try {
      //console.log("useSameChords = " + useSameChords);
      //console.log("key: " + chosenKey);
      console.time("calculate");
      const rocket = wasmModule.calculate(
        mass, 
        targetDeltaV, 
        minimumTwr, 
        maximumTwr, 
        inVacuum, 
        needsGimballing, 
        useNosecone,
        diameter,
        fuselages,
        techNodes,
        noseHeight,
      );
      console.timeEnd("calculate");
      
      setResult(rocket);
    } catch (error) {
      console.error("Error calculating rocket", error);
      alert("An error occurred while calculating the rocket.");
    }
  };

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit}>
        <div>
        <div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={mass}
                    onChange={setMass}
                    id="payloadMass"
                    label="Enter the payload's mass in metric tons:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The mass of the payload or upper stages in metric tons (1000 kg).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={targetDeltaV}
                    onChange={setTargetDeltaV}
                    id="targetDeltaV"
                    label="Enter the target delta-v in m/s:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The target delta-v for this stage.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={minimumTwr}
                    onChange={setMinimumTwr}
                    id="minimumTwr"
                    label="Enter the minimum TWR of this stage:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The calculator will only output rocket parts that exceed this TWR.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={maximumTwr}
                    onChange={setMaximumTwr}
                    id="maximumTwr"
                    label="Enter the maximum TWR of this stage:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The calculator will only output rocket parts that do not exceed this TWR.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={diameter}
                    onChange={setDiameter}
                    id="diameter"
                    label="Enter the desired diameter for this stage:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The diameter of the parts that should be used in this stage.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <input 
                    type="checkbox"
                    id="inVacuum"
                    checked={inVacuum}
                    onChange={handleInVacuumChange}
                  />
                  <label htmlFor="inVacuum">Is this stage in a vacuum?</label>
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    When checked, the calculator will use the vacuum delta-v calculations.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <input 
                    type="checkbox"
                    id="needsGimballing"
                    checked={needsGimballing}
                    onChange={handleNeedsGimballingChange}
                  />
                  <label htmlFor="needsGimballing">Should this stage have gimballing?</label>
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    When checked, the calculator will only use engines that have more than 
                    0 degrees of gimballing.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <input 
                    type="checkbox"
                    id="useNosecone"
                    checked={useNosecone}
                    onChange={handleUseNoseconeChange}
                  />
                  <label htmlFor="useNosecone">Should this stage use nosecones?</label>
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    When checked, the calculator will use nosecones on top of every engine, 
                    along with some cylindrical tanks.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="w-full text-left"><div>
                <MultiSelect
                  options={fuselageList}
                  selectedOptions={fuselages}
                  setSelectedOptions={handleFuselageSelection}
                  label="Pick your unlocked fuselages:"
                />
              </div></TooltipTrigger>
              <TooltipContent>
                <p className="text-lg max-w-md">
                  These fuselages will be used in the rocket calculator.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="w-full text-left"><div>
                <MultiSelect
                  options={techNodeList}
                  selectedOptions={techNodes}
                  setSelectedOptions={handleTechNodeSelection}
                  label="Pick your unlocked tech tree nodes:"
                />
              </div></TooltipTrigger>
              <TooltipContent>
                <p className="text-lg max-w-md">
                  The rockets from these tech tree nodes will be used in the rocket 
                  calculator.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button type="submit">Calculate Rocket</Button>
      </form>

      {result &&
        <div>
      {/* Using the midi-player custom element for MIDI playback */}
      <p>{result}</p>
      </div>
      }
      <SavedChords 
        isOpen={savedRocketsOpen}
        onClose={() => setSavedRocketsOpen(false)}
        currentChords={(name) => {
          // Create a function that returns the current settings
          const settingsToSave = {
            mass,
            targetDeltaV,
            minimumTwr,
            maximumTwr,
            inVacuum,
            needsGimballing,
            useNosecone,
            diameter
          };
          return settingsToSave;
        }}
        onLoadProgression={handleLoadSettings}
        filterType="generated"
      />
    </div>
  );
};

export default Calculate;