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
  TableHeader,  // ← renders as <thead>
  TableRow,     // ← renders as <tr>
  TableHead,    // ← renders as <th>
  TableBody,    // ← renders as <tbody>
  TableCell,    // ← renders as <td>
} from '@/components/ui/table'
import { Select } from '@/components/ui/select' // assume you have a <Select> component
import { debug } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// 1) Make sure this matches exactly your JSON‐parsed keys!
// ─────────────────────────────────────────────────────────────────────────────
export const columns = [
  {
    accessorKey: 'engine',
    header: 'Engine',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'diameter',
    header: 'Diameter',
    filterFn: 'equals',        // require exact numeric match
    sortingFn: 'basic',
  },
  {
    accessorKey: 'wetMass',
    header: 'Wet Mass',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'dryMass',
    header: 'Dry Mass',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'deltaVVac',
    header: 'ΔV (Vac)',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'deltaVAsl',
    header: 'ΔV (ASL)',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'twr',
    header: 'TWR',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'num_engines',
    header: '# Engines',
  },
  {
    accessorKey: 'cyl_length',
    header: 'Cylinder Length',
  },
  {
    accessorKey: 'cyl_fuselage',
    header: 'Cylinder Fuselage',
  },
  {
    accessorKey: 'nose_length',
    header: 'Nose Length',
  },
  {
    accessorKey: 'nose_fuselage',
    header: 'Nose Fuselage',
  },
]

export default function RocketTable({ wasmJsonData }) {
  const [data, setData] = useState([])
  // ○ The “columnFilters” array for React-Table
  const [columnFilters, setColumnFilters] = useState([])
  // ○ The “sorting” array for React-Table
  const [sorting, setSorting] = useState(
    // If you want to start with a pre-set two-level sort:
    [
      // 1) Primary sort: diameter (ascending)
      { id: 'diameter', desc: false },
      // 2) Secondary sort: deltaVVac (descending)
      { id: 'deltaVVac', desc: true },
    ]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Parse the incoming JSON exactly once into an array of RocketRow objects
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      debug('Parsing incoming WASM JSON…')
      const parsed = JSON.parse(wasmJsonData).map((r) => ({
        // Notice each key here matches the “accessorKey” above
        engine: r.engine,
        diameter: r.diameter,
        wetMass: r.wetMass,
        dryMass: r.dryMass,
        deltaVVac: r.deltaVVac,
        deltaVAsl: r.deltaVAsl,
        twr: r.twr,
        num_engines: r.numEngines,
        cyl_length: r.cylLength ?? 'N/A',
        cyl_fuselage: r.cylFuselage ?? 'N/A',
        nose_length: r.noseLength ?? 'N/A',
        nose_fuselage: r.noseFuselage ?? 'N/A',
      }))
      debug(parsed)
      setData(parsed)
    } catch (e) {
      console.error('Error parsing WASM JSON data:', e)
    }
  }, [wasmJsonData])

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) Build the React-Table instance with BOTH “columnFilters” and “sorting”
  // ─────────────────────────────────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Enable multi-sort so Shift+Click will add a second-level sort
    enableMultiSort: true,
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) Compute the distinct list of engines & diameters from data,
  //    so we can populate our dropdowns. Use useMemo so it only changes
  //    when “data” changes.
  // ─────────────────────────────────────────────────────────────────────────────
  const allEngines = React.useMemo(() => {
    const setOfEngines = new Set()
    data.forEach((row) => {
      setOfEngines.add(row.engine)
    })
    return Array.from(setOfEngines).sort()
  }, [data])

  const allDiameters = React.useMemo(() => {
    const setOfDiam = new Set()
    data.forEach((row) => {
      setOfDiam.add(row.diameter)
    })
    return Array.from(setOfDiam).sort((a, b) => a - b)
  }, [data])

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) Helpers to get the current filter values for each column:
  // ─────────────────────────────────────────────────────────────────────────────
  const currentEngineFilter =
    columnFilters.find((f) => f.id === 'engine')?.value ?? ''
  const currentDiameterFilter =
    columnFilters.find((f) => f.id === 'diameter')?.value ?? ''

  return (
    <div className="space-y-4">
      {/* ─────────────────────────────────────────────────────────────────────── 
          UI: Engine filter dropdown 
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2">
        <label htmlFor="engine-filter" className="font-medium">
          Filter by Engine:
        </label>
        <Select
          id="engine-filter"
          value={currentEngineFilter}
          onValueChange={(val) => {
            // If val is an empty string, clear the filter:
            if (val === '') {
              // Remove any existing “engine” filter
              setColumnFilters((old) =>
                old.filter((f) => f.id !== 'engine')
              )
            } else {
              // Overwrite (or add) the “engine” filter
              setColumnFilters((old) => {
                // Copy everything except “engine”
                const withoutEngine = old.filter((f) => f.id !== 'engine')
                return [...withoutEngine, { id: 'engine', value: val }]
              })
            }
          }}
        >
          {/* First option = “no filter” */}
          <option value="">All Engines</option>
          {allEngines.map((eng) => (
            <option key={eng} value={eng}>
              {eng}
            </option>
          ))}
        </Select>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── 
          UI: Diameter filter dropdown 
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2">
        <label htmlFor="diameter-filter" className="font-medium">
          Filter by Diameter:
        </label>
        <Select
          id="diameter-filter"
          value={currentDiameterFilter}
          onValueChange={(val) => {
            if (val === '') {
              setColumnFilters((old) =>
                old.filter((f) => f.id !== 'diameter')
              )
            } else {
              // Because diameter is numeric in the data, store it as a string here:
              setColumnFilters((old) => {
                const withoutDiam = old.filter((f) => f.id !== 'diameter')
                return [
                  ...withoutDiam,
                  { id: 'diameter', value: val },
                ]
              })
            }
          }}
        >
          <option value="">All Diameters</option>
          {allDiameters.map((diam) => (
            <option key={diam} value={diam.toString()}>
              {diam.toFixed(2)} m
            </option>
          ))}
        </Select>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── 
          UI: Table itself 
          ─────────────────────────────────────────────────────────────────────── */}
      <Table>
        {/* ─────────────────────────────────────────────────────────────────── 
            Because this comes from ShadCN/UI’s `TableHeader`, it renders
            a <thead>. Inside we render one <tr> and then 11 <th> cells.
            ─────────────────────────────────────────────────────────────────── */}
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  // Allow click on header to toggle sort. If you hold ⇧ while clicking,
                  // it will add a second-level sort (multi-sort), because we enabled
                  // `enableMultiSort: true` above.
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted()] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}