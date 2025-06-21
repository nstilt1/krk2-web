"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import useLocalStorage from '@/hooks/useLocalStorage';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Calculate from './Calculate';
import CheatSheet from './CheatSheet';
import ChordFinder from './ChordFinder';

const WasmApp = ({ showExtraControls, cpbRef, wasmModule, toggleExtraControls }) => {
  const [fuselages, setFuselages] = useLocalStorage("fuselages", ["Steel Fuselage"]);
  const [techNodes, setTechNodes] = useLocalStorage("techNodes", ["start"]);
  // payload mass in Tons
  const [mass, setMass] = useLocalStorage("mass", 0.0);
  const [targetDeltaV, setTargetDeltaV] = useLocalStorage("targetDeltaV", 0.0);
  const [minimumTwr, setMinimumTwr] = useLocalStorage("minimumTwr", 1.0);
  const [maximumTwr, setMaximumTwr] = useLocalStorage("maximumTwr", 5.0);
  const [inVacuum, setInVacuum] = useLocalStorage("inVacuum", false);
  const [needsGimballing, setNeedsGimballing] = useLocalStorage("needsGimballing", false);
  const [useNosecone, setUseNosecone] = useLocalStorage("useNosecone", false);
  const [diameter, setDiameter] = useLocalStorage("diameter", 0.3);
  const [extraFuelPercentage, setExtraFuelPercentage] = useLocalStorage("extraFuel", 3.0);
  const [noseHeight, setNoseHeight] = useLocalStorage("nose_height", 0.0);

  const handleTechNodeSelection = (option) => {
    if (techNodes.includes(option)) {
      setTechNodes(techNodes.filter((item) => item !== option));
    } else {
      setTechNodes([...techNodes, option]);
    }
  };

  const handleFuselageSelection = (option) => {
    if (fuselages.includes(option)) {
      setFuselages(fuselages.filter((item) => item !== option));
    } else {
      setFuselages([...fuselages, option]);
    }
  };

  const techNodeList = [
    "start",
    "Post-War Rocketry Testing",
    "Early Rocketry",
    "Basic Rocketry",
    "1956-1957 Orbital Rocketry",
    /*
    "1958 Orbital Rocketry",
    "1959 Orbital Rocketry",
    "1960 Orbital Rocketry",
    */
   "Lunar Landing",
   "2009-2013 Orbital Rocketry",
   "2014-2018 ORSC Engines",
   "2014-2018 Orbital Rocketry",
   "2019-2028 Orbital Rocketry",
  ];

  const fuselageList = [
    "Steel Fuselage",
    "Al Fuselage",
    "Al Stringer Tank",
    "Refined Al Stringer Tank",
    "Al-Li Stringer Tank",
    "Refined Al-Li Stringer Tank",
    "Steel Stir-Welded Tank"
  ];

  return (
    <div>
      {wasmModule ? 
        <div>
          <Tabs defaultValue="calculator">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="cheat-sheet">Rocket Tables</TabsTrigger>
              {/* <TabsTrigger value="chord-finder">Chord Finder</TabsTrigger> */}
            </TabsList>
            <TabsContent value="calculator">
              <Card>
                <CardHeader>
                  <CardTitle><span className="blend">&quot;</span>AI<span className="blend">&quot;</span> KSP Realism Overhaul Rocket Calculator</CardTitle>
                </CardHeader>
                <CardContent>
              <Calculate
                wasmModule={wasmModule}
                showExtraControls={showExtraControls}
                toggleExtraControls={toggleExtraControls}
                fuselages={fuselages}
                handleFuselageSelection={handleFuselageSelection}
                techNodes={techNodes}
                handleTechNodeSelection={handleTechNodeSelection}
                mass={mass}
                setMass={setMass}
                targetDeltaV={targetDeltaV}
                setTargetDeltaV={setTargetDeltaV}
                minimumTwr={minimumTwr}
                setMinimumTwr={setMinimumTwr}
                maximumTwr={maximumTwr}
                setMaximumTwr={setMaximumTwr}
                inVacuum={inVacuum}
                setInVacuum={setInVacuum}
                needsGimballing={needsGimballing}
                setNeedsGimballing={setNeedsGimballing}
                useNosecone={useNosecone}
                setUseNosecone={setUseNosecone}
                noseHeight={noseHeight}
                setNoseHeight={setNoseHeight}
                diameter={diameter}
                setDiameter={setDiameter}
                fuselageList={fuselageList}
                techNodeList={techNodeList}
                extraFuelPercentage={extraFuelPercentage}
                setExtraFuelPercentage={setExtraFuelPercentage}
              />
              </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="cheat-sheet">
              <Card>
                <CardHeader>
                  <CardTitle>Rocket Tables</CardTitle>
                </CardHeader>
                <CardContent>
              <CheatSheet
                wasmModule={wasmModule}
                mass={mass}
                setMass={setMass}
                inVacuum={inVacuum}
                setInVacuum={setInVacuum}
                minimumTwr={minimumTwr}
                setMinimumTwr={setMinimumTwr}
                useNosecone={useNosecone}
                setUseNosecone={setUseNosecone}
                noseHeight={noseHeight}
                setNoseHeight={setNoseHeight}
                needsGimballing={needsGimballing}
                setNeedsGimballing={setNeedsGimballing}
                unlockedFuselages={fuselages}
                handleFuselageSelection={handleFuselageSelection}
                unlockedTechNodes={techNodes}
                handleTechNodeSelection={handleTechNodeSelection}
                fuselageList={fuselageList}
                techNodeList={techNodeList}
                extraFuelPercentage={extraFuelPercentage}
                setExtraFuelPercentage={setExtraFuelPercentage}
                cpbRef={cpbRef}
              />
              </CardContent>
              </Card>
            </TabsContent>
            {/* <TabsContent value="chord-finder">
              <Card>
                <CardHeader>
                  <CardTitle>Chord Finder</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* <ChordFinder
                    wasmModule={wasmModule}
                    chosenKey={key}
                    setKey={setKey}
                    chordGroup={chordGroup}
                    setChordGroup={setChordGroup}
                    customChords={customChords}
                    scale={scale}
                    setScale={setScale}
                    handleChordTypeSelection={handleChordTypeSelection}
                    keys={keys}
                    chordGroups={chordGroups}
                    customChordTypes={customChordTypes}
                    scales={scales}
                    showExtraControls={showExtraControls}
                    tableScheme={tableScheme}
                    setTableScheme={setTableScheme}
                    tableSchemes={tableSchemes}
                    cpbRef={cpbRef}
                  /> 
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
          </div> : <p>Loading...</p>}
    </div>
  );
};

export default WasmApp;
