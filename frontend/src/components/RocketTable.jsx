import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { debug } from "@/lib/utils";

export const columns = [
  { accessorKey: 'deltaVVac',    header: 'ΔV (Vac)',        sortingFn: 'basic' },
  { accessorKey: 'deltaVAsl',    header: 'ΔV (ASL)',        sortingFn: 'basic' },
  { accessorKey: 'wetMass',         header: 'Wet Mass',            sortingFn: 'basic' },
  { accessorKey: 'diameter',     header: 'Diameter',        filterFn: 'includesString' },
  { accessorKey: 'engine',       header: 'Engine',          filterFn: 'includesString' },
  { accessorKey: 'numEngines',    header: '# Tanks',         filterFn: 'includesString' },
  { accessorKey: 'cylLength',   header: 'Cylinder Length' },
  { accessorKey: 'cylFuselage', header: 'Cylinder Fuselage' },
  { accessorKey: 'noseLength',  header: 'Nose Length' },
  { accessorKey: 'noseFuselage',header: 'Nose Fuselage' },
  { accessorKey: 'twr',          header: 'TWR',             sortingFn: 'basic' },
]

export default function RocketTable({ wasmJsonData }) {
  const [data, setData] = useState([])
  const [filterValue, setFilterValue] = useState('')

  useEffect(() => {
    try {
      debug("Parsing json");
      const parsed = JSON.parse(wasmJsonData).map(r => ([{
        deltaVVac:    r.deltaVVac,
        deltaVAsl:    r.deltaVAsl,
        wetMass:         r.wetMass,
        diameter:     r.diameter,
        engine:       r.engine,
        numEngines:    r.numEngines,
        cylLength:   r.cylLength   ?? 'N/A',
        cylFuselage: r.cylFuselage ?? 'N/A',
        noseLength:  r.noseLength  ?? '0',
        noseFuselage:r.noseFuselage?? 'N/A',
        twr:          r.twr,
      }]));
      debug(parsed);
      setData(parsed)
    } catch (e) {
      console.error('Error parsing WASM JSON data:', e)
    }
  }, [wasmJsonData])

  const table = useReactTable({
    data,
    columns,
    // Controlled filter state for the “mass” column only:
    state: {
      columnFilters: [{ id: 'mass', value: filterValue }],
    },
    onColumnFiltersChange: newFilters => {
      // Extract the mass filter out of the newFilters array:
      const massFilter = newFilters.find(f => f.id === 'mass')
      setFilterValue(massFilter?.value ?? '')
    },
    getCoreRowModel:    getCoreRowModel(),
    getFilteredRowModel:getFilteredRowModel(),
    getSortedRowModel:  getSortedRowModel(),
  })

  return (
    <>
      <Input
        placeholder="Filter by mass"
        value={filterValue}
        onChange={e => setFilterValue(e.target.value)}
      />

      <Table>
        <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                    <TableHeader
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    >
                    {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                    </TableHeader>
                ))}
                </TableRow>
            ))}
            </TableHead>

        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}