"use client";

import { useState } from "react";
import Selector from "./Selector";
import { Button } from "./ui/button";
import ChordTable from "./ChordTable";
import MultiSelect from "./MultiSelector";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import Chord from "./Chord";
import { Checkbox } from "./ui/checkbox";
import useLocalStorage from "@/hooks/useLocalStorage";
import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from "./ui/tooltip";
import RocketTable from "./RocketTable";
import NumberInput from "./NumberInput";
import { debug } from "@/lib/utils";

const CheatSheet = ({
    wasmModule,
    mass,
    setMass,
    inVacuum,
    setInVacuum,
    needsGimballing,
    setNeedsGimballing,
    minimumTwr,
    setMinimumTwr,
    useNosecone,
    setUseNosecone,
    noseHeight,
    setNoseHeight,
    unlockedFuselages,
    handleFuselageSelection,
    unlockedTechNodes,
    handleTechNodeSelection,
    fuselageList,
    techNodeList,
    extraFuelPercentage,
    setExtraFuelPercentage,
    cpbRef
}) => {
    const [result, setResult] = useState(null);


    const [chords, setChords] = useState([]);
    const [allChords, setAllChords] = useState([]);  
    const [showProbabilities, setShowProbabilities] = useLocalStorage("showProbability", false);

    const handleShowProbabilitiesChange = () => {
        setShowProbabilities(!showProbabilities);
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

        try {
            console.time("rocket_table");
            const json = await wasmModule.max_dv(
                mass,
                inVacuum,
                minimumTwr,
                needsGimballing,
                useNosecone,
                unlockedFuselages,
                unlockedTechNodes,
                extraFuelPercentage,
                noseHeight,
            );
            console.timeEnd("rocket_table");
            debug("json = " + json);

            setResult(json);
            //console.log(data);
        } catch (error) {
            console.error("Error getting rocket table", error);
            alert("An error occurred while computing the rocket table.");
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
            
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
            {useNosecone && (
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="w-full text-left"><div>
                  <NumberInput 
                    value={noseHeight}
                    onChange={setNoseHeight}
                    id="noseHeight"
                    label="Enter the nosecone height in meters:"
                  />
                </div></TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg max-w-md">
                    The calculator will use this height for nosecones in this stage.
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
                      <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="w-full text-left"><div>
                <MultiSelect
                  options={fuselageList}
                  selectedOptions={unlockedFuselages}
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
                  selectedOptions={unlockedTechNodes}
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
                
            <Button type="submit">Get Chords</Button>
            {result && <div>
                <RocketTable wasmJsonData={result} />
            </div>}
            </form>
        </div>
    );
}

export default CheatSheet;