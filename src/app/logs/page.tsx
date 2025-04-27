'use client';
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AG_GRID_LOCALE_SE } from '@/utils/translations';
import { deleteStoredToken, getLogs, getWorkshops, LogsType, WorkshopsType } from '@/utils/actions';
import { FaAngleLeft } from 'react-icons/fa';

ModuleRegistry.registerModules([AllCommunityModule]);

const transformLogData = (data: { rawData: string }) => {
  const lines = data.rawData.trim().replace(/\r/g, '').split('\n');

  const extractLines = (keyword: string) =>
    lines
      .filter(line => line.includes(keyword) && line.includes('Load..Gas'))
      .map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          timestamp: parts[1],
          event: parts[3],
          values: parts.slice(5).map(String),
        };
      });

  const spikeLines = extractLines('T_Spike');
  const paddleLines = extractLines('T_Paddle');

  return [...spikeLines, ...paddleLines];
};

export default function LogsPage() {
  const [selectedWorkshopData, setSelectedWorkshopData] = useState<
    | {
        id: number;
        name: string;
        serial: string;
        logs: string[];
      }
    | undefined
  >(undefined);
  const [selectedLogData, setSelectedLogData] = useState<LogsType | undefined>(undefined);
  const [workShopsData, setWorkShopsData] = useState<WorkshopsType | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWorkshops();
        setWorkShopsData(data);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Unauthorized') {
            alert('Sessionen har gått ut.. du loggas ut');
            await deleteStoredToken();
          }
          alert(error.message);
        }
      }
    };

    fetchData();
  }, []);

  const handleOnDateClick = async (id: string, date: string) => {
    try {
      const formatedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
      const logs = await getLogs(id, formatedDate);
      setSelectedDate(formatedDate);
      setSelectedLogData(logs);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          alert('Sessionen har gått ut.. du loggas ut');
          await deleteStoredToken();
        }
        alert(error.message);
      }
    }
  };
  return (
    <main className="p-4 max-w-7xl mx-auto">
      {workShopsData && !selectedWorkshopData && (
        <>
          <h1 className="text-2xl my-4 font-bold">Tillgängliga Verkstäder</h1>
          <div style={{ height: 500 }}>
            <AgGridReact
              rowData={workShopsData}
              defaultColDef={{
                cellClass: 'cursor-pointer',
                onCellClicked: event => setSelectedWorkshopData(event?.data),
                filter: true,
              }}
              columnDefs={[
                { field: 'id', headerName: 'Id' },
                { field: 'name', headerName: 'Namn' },
                { field: 'serial', headerName: 'Serie nummer' },
                {
                  field: 'logs',
                  headerName: 'Datum',
                  filter: true,
                  flex: 1,
                  cellClass: 'cursor-pointer',
                },
              ]}
              localeText={AG_GRID_LOCALE_SE}
            />
          </div>
        </>
      )}
      {selectedWorkshopData && !selectedLogData && (
        <div className="flex flex-col gap-4">
          <button
            className=" p-2 rounded-lg bg-sky-500 cursor-pointer max-w-fit font-bold flex gap-1 items-center"
            onClick={() => setSelectedWorkshopData(undefined)}
          >
            <FaAngleLeft />
            <span> Tillbaka till verkstäder</span>
          </button>
          <div className="grid grid-cols-12  gap-4">
            <section className="col-span-12 md:col-span-3 p-4 px-4 border rounded-lg  bg-white text-black ">
              <h1 className="text-xl  font-bold">Vald verkstad:</h1>
              <h3>
                <span className="font-bold">Namn:</span> {selectedWorkshopData?.name}
              </h3>
              <h3 className="  ">
                <span className="font-bold">Id:</span> {selectedWorkshopData?.id}
              </h3>
              <h3>
                <span className="font-bold">Serie nummer:</span> {selectedWorkshopData?.serial}
              </h3>
              <h3>
                <span className="font-bold">Antal Datum:</span> {selectedWorkshopData?.logs.length}
              </h3>
            </section>
            <div style={{ height: 500 }} className={'col-span:12 md:col-span-9'}>
              <AgGridReact
                rowData={selectedWorkshopData?.logs.map(log => {
                  return {
                    logs: log,
                  };
                })}
                defaultColDef={{
                  cellClass: 'cursor-pointer',
                  filter: true,
                  onCellClicked: event =>
                    handleOnDateClick(String(selectedWorkshopData?.id), event.value),
                }}
                columnDefs={[
                  {
                    field: 'logs',
                    headerName: 'Datum',
                    // filter: 'agDateColumnFilter',

                    flex: 1,
                  },
                ]}
                localeText={AG_GRID_LOCALE_SE}
              />
            </div>
          </div>
        </div>
      )}

      {selectedLogData && (
        <div className="flex flex-col gap-4">
          <button
            className=" p-2 rounded-lg bg-sky-500 cursor-pointer max-w-fit font-bold flex items-center gap-1"
            onClick={() => {
              setSelectedLogData(undefined);
              setSelectedDate(null);
            }}
          >
            <FaAngleLeft />
            <span>Tillbaka till Datum</span>
          </button>

          <div className="grid grid-cols-12 gap-4">
            <section className="col-span-12 md:col-span-3 p-4  border rounded-lg  bg-white text-black ">
              <h1 className="text-xl  font-bold">Vald verkstad:</h1>
              <h3>
                <span className="font-bold">Namn:</span> {selectedWorkshopData?.name}
              </h3>
              <h3>
                <span className="font-bold">Id:</span> {selectedWorkshopData?.id}
              </h3>
              <h3>
                <span className="font-bold">Serie nummer:</span> {selectedWorkshopData?.serial}
              </h3>
              <h3>
                <span className="font-bold">Vald Datum:</span> {selectedDate}
              </h3>
              <h3>
                <span className="font-bold">Antal mätningar:</span>{' '}
                {transformLogData(selectedLogData).length}
              </h3>
            </section>
            <div style={{ height: 500 }} className={'col-span-12 md:col-span-9'}>
              <AgGridReact
                rowData={transformLogData(selectedLogData)}
                defaultColDef={{
                  cellClass: 'cursor-pointer',
                  filter: true,
                }}
                columnDefs={[
                  {
                    field: 'timestamp',
                    headerName: 'Tid',
                  },
                  {
                    field: 'event',
                    headerName: 'Givare',
                  },
                  {
                    field: 'values',
                    headerName: 'Värde(n)',
                    flex: 1,
                  },
                ]}
                localeText={AG_GRID_LOCALE_SE}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
