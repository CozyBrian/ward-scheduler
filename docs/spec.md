
# Ward Schedule Timetable Web App Specification

## Overview
A **single-user, open web application** for generating, editing, and exporting ward schedules in a grid format. Users can define people, departments, shifts, and off days. Timetables can be regenerated while respecting scheduling rules, manually adjusted, and exported.  

## Target Platform
- Web application  
- Desktop and tablet layouts  
- Single-user, open access (no authentication)  
- Hosted on **Vercel**  
- Built on **React + Vite**, with Shadcn CLI for UI controls  

## Data Model

### Person
- **Fields**:  
  - `name` (required)  
  - `department` (optional, only one)  
- Departments managed separately  
- Multiple timetables can be saved and loaded  

### Department
- Optional grouping for visual separation  
- Alphabetical order  
- Toggle grouping on/off  

### Shift
- Symbols: `M` (Morning), `A` (Afternoon), `E` (Evening), `X` (Off)  
- Each person can have **only one shift per day**  
- **Rule:** Before assigning `E`, the person must have an `X` the previous day  
- Editable manually; violations will **warn but allow**  

### Timetable
- Grid format:  
  - Names in first column  
  - Dates in first row  
  - Cells show **only symbols** by default  
  - Optional **color mode** with legend, toggleable  
- Date range specified by user (start and end date)  
- Maximum: ~50 people, ~1 month  

## Shift Assignment & Generation
- Fully **auto-generated** with even distribution of shifts  
- Respect `X` days and "X before E" rule  
- Users can manually override shifts  
- Regeneration **regenerates entire grid**, respecting rules  
- Undo/redo available for manual edits and regenerations  

## Grid Display
- Visual display of shifts: symbols or colors  
- Department grouping optional  
- Rule violations highlighted in-grid  
- Warnings for rule conflicts, manual override, deletion, and regeneration  
- Mouse-only interaction; no keyboard shortcuts  

## Export & Print
- **Exact representation** as displayed (symbols or colors)  
- Supported formats: CSV  
- CSV includes: person name, shift symbols, dates  
- Grid respects department grouping and selected date range  

## User Controls & UI
- Appropriate Shadcn controls used for:  
  - Date range selection  
  - Department selection  
  - Color/symbol toggle  
- Shadcn integrated via CLI; custom components allowed where necessary  
- Minimal, self-explanatory UI, no tooltips/legend needed for now  

## Performance & Limits
- Grid efficiently handles up to **50 people** and **1 month** of dates  
- Client-side storage; export/import for persistence  
- Multiple timetables can be saved and loaded locally  

## Technical Stack
- React + Vite project  
- State management: open (developer choice)  
- Hosting: Vercel  
- Pure frontend; all data stored client-side  
