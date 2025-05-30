import { useEffect, useState } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel } from "@tanstack/react-table";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

/*
const data = [
    { id: 1, deltaVVac: 1000, deltaVAsl: 800, mass: 2.5 },
    { id: 2, deltaVVac: 1500, deltaVAsl: 1200, mass: 3.0 },
    { id: 3, deltaVVac: 2000, deltaVAsl: 1800, mass: 4.2 },
];
*/

export const columns = [
    { accessorKey: "deltaVVac", header: "ΔV (Vac)", sortingFn: "basic" },
    { accessorKey: "deltaVAsl", header: "ΔV (ASL)", sortingFn: "basic" },
    { accessorKey: "mass", header: "Mass", sortingFn: "basic" },
    { accessorKey: "diameter", header: "Diameter", filterFn: "includesString" }, // Filterable
    { accessorKey: "engine", header: "Engine", filterFn: "includesString" }, // Filterable
    { accessorKey: "num_tanks", header: "# Tanks", filterFn: "includesString" },
    { accessorKey: "cyl_length", header: "Cylinder Length" }, // No sorting or filtering
    { accessorKey: "nose_length", header: "Nose Length" }, // No sorting or filtering
    { accessorKey: "cyl_fuselage", header: "Cylinder Fuselage" },
    { accessorKey: "nose_fuselage", header: "Nose Fuselage" },
    { accessorKey: "twr", header: "TWR", sortingFn: "basic" },
];


export default function RocketTable({ wasmJsonData }) {
    const [data, setData] = useState([]);
    const [filterValue, setFilterValue] = useState("");

    useEffect(() => {
        try {
            const parsedData = JSON.parse(wasmJsonData).map((rocket) => ({
                deltaVVac: rocket.delta_v_vac,
                deltaVAsl: rocket.delta_v_asl,
                mass: rocket.mass,
                diameter: rocket.diameter.diameter,
                engine: rocket.engine.name,
                num_tanks: rocket.num_tanks,
                cyl_length: rocket.cyl_length || "N/A",
                cyl_fuselage: rocket.cyl_fuselage || "N/A",
                nose_length: rocket.nose_length || "N/A",
                nose_fuselage: rocket.nose_fuselage || "N/A",
                twr: rocket.twr,
            }));
            setData(parsedData);
        } catch (error) {
            console.error("Error parsing WASM JSON data:", error);
        }
    }, [wasmJsonData]);


    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { columnFilters: [{ id: "mass", value: filterValue }] },
    });

    return (
        <div>
            <Input
                placeholder="Filter by mass"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
            />
            <Table>
                <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHeader key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                    {header.column.columnDef.header}
                                </TableHeader>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>{cell.renderValue()}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}