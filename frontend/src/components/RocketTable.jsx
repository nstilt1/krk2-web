import React, { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'

import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { debug } from '@/lib/utils'

// ──────────────────────────────────────────────
// 1) Make sure the column “accessorKey” names match
//    exactly the keys you put on each object below.
// ──────────────────────────────────────────────
export const columns = [
  { accessorKey: 'deltaVVac',    header: 'ΔV (Vac)',        sortingFn: 'basic' },
  { accessorKey: 'deltaVAsl',    header: 'ΔV (ASL)',        sortingFn: 'basic' },
  { accessorKey: 'mass',         header: 'Mass',            sortingFn: 'basic' },
  { accessorKey: 'diameter',     header: 'Diameter',        filterFn: 'includesString' },
  { accessorKey: 'engine',       header: 'Engine',          filterFn: 'includesString' },
  { accessorKey: 'num_tanks',    header: '# Tanks',         filterFn: 'includesString' },
  { accessorKey: 'cyl_length',   header: 'Cylinder Length' },
  { accessorKey: 'cyl_fuselage', header: 'Cylinder Fuselage' },
  { accessorKey: 'nose_length',  header: 'Nose Length' },
  { accessorKey: 'nose_fuselage',header: 'Nose Fuselage' },
  { accessorKey: 'twr',          header: 'TWR',             sortingFn: 'basic' },
]

export default function RocketTable({ wasmJsonData }) {
  const [data, setData] = useState([])
  const [filterValue, setFilterValue] = useState('')

  useEffect(() => {
    try {
      debug('Parsing wasm JSON…')
      const parsed = JSON.parse(wasmJsonData).map(r => ({
        // ──────────────────────────────────
        // 2) Return a plain object (not [ { … } ]), AND
        //    use EXACTLY the same key names as your columns:
        // ──────────────────────────────────
        deltaVVac:    r.deltaVVac,
        deltaVAsl:    r.deltaVAsl,
        mass:         r.wetMass,           // “mass” matches accessorKey: 'mass'
        diameter:     r.diameter,
        engine:       r.engine,
        num_tanks:    r.numEngines,        // “num_tanks” matches accessorKey: 'num_tanks'
        cyl_length:   r.cylLength   ?? 'N/A',
        cyl_fuselage: r.cylFuselage ?? 'N/A',
        nose_length:  r.noseLength  ?? '0',
        nose_fuselage:r.noseFuselage?? 'N/A',
        twr:          r.twr,
      }))
      debug("parsed = " + parsed)
      setData(parsed)
    } catch (e) {
      console.error('Error parsing WASM JSON data:', e)
    }
  }, [wasmJsonData])

  const table = useReactTable({
    data,
    columns,
    // Only control the “mass” filter via filterValue:
    state: {
      columnFilters: [{ id: 'mass', value: filterValue }],
    },
    onColumnFiltersChange: newFilters => {
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
            // One <TableRow> per headerGroup (you’ll have exactly one group in a flat table)
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                // One <TableHeader> (i.e. <th>) per column in that group
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