export interface DataGovProvider {
  search(query: string): Promise<Array<{ title: string; sourceUrl: string }>>;
}

export class DataGovProviderImpl implements DataGovProvider {
  async search(_query: string) {
    return [
      {
        title: "MoSPI datasets on data.gov.in",
        sourceUrl: "https://www.data.gov.in/",
      },
    ];
  }
}

export function getDataGovProvider() {
  return new DataGovProviderImpl();
}
