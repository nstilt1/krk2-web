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
import RocketTable from "./RocketTable";

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
  customDiameter,
  setCustomDiameter,
  handleUseCustomDiameterChange,
  useCustomDiameter,
  extraFuelPercentage,
  setExtraFuelPercentage,
  useMultipleEngines,
  handleUseMultipleEnginesChange,
  maxNumEngines,
  setMaxNumEngines,
  maxNumTanks,
  setMaxNumTanks,
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
        fuselages,
        techNodes,
        noseHeight,
        useCustomDiameter,
        customDiameter,
        extraFuelPercentage,
        useMultipleEngines,
        maxNumEngines,
        maxNumTanks,
      );
      console.timeEnd("calculate");
      
      setResult(rocket);
    } catch (error) {
      console.error("Error calculating rocket", error);
      alert("An error occurred while calculating the rocket.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-[95vw]">
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
                    value={maxNumTanks}
                    onChange={setMaxNumTanks}
                    id="maxNumTanks"
                    label="Enter the max number of tanks to use with this stage:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The calculator will use up to this many tanks with this stage.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={extraFuelPercentage}
                    onChange={setExtraFuelPercentage}
                    id="extraFuel"
                    label="Enter how much extra fuel should be added to the rated burn time (%):"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The calculator will use this many percent of fuel above or below the rated burn time.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <input 
                    type="checkbox"
                    id="useCustomDiameter"
                    checked={useCustomDiameter}
                    onChange={handleUseCustomDiameterChange}
                  />
                  <label htmlFor="useCustomDiameter">Do you want to use a custom payload/tank diameter?</label>
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    When checked, the calculator will use a custom tank diameter provided by the number input.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {useCustomDiameter && (
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={customDiameter}
                    onChange={setCustomDiameter}
                    id="customDiameter"
                    label="Enter the desired tank diameter in meters:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The calculator will use this diameter for the tanks in this stage.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <input 
                    type="checkbox"
                    id="useMultipleEngines"
                    checked={useMultipleEngines}
                    onChange={handleUseMultipleEnginesChange}
                  />
                  <label htmlFor="useMultipleEngines">Do you want to use multiple engines per tank?</label>
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    When checked, the calculator will use multiple engines with each tank.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {useMultipleEngines && (
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={maxNumEngines}
                    onChange={setMaxNumEngines}
                    id="maxNumEngines"
                    label="Enter the maximum amount of engines to use per tank:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The calculator will use up to this many engines on each tank in this stage.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            )}
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
            {useNosecone && (
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={noseHeight}
                    onChange={setNoseHeight}
                    id="noseHeight"
                    label="Enter the nosecone's height in meters:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The nosecone height for this stage.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            )}
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
          <RocketTable wasmJsonData={result} />
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