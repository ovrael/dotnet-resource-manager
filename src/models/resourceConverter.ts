import { ResourceData } from "./resourceData";
import { ResourceFile } from "./resourceFile";
import { ResourceFileDataRecord } from "./resourceFileDataRecord";
import { ResourceRow } from "./resourceRow";
import { ResourceTableData } from "./resourceTableData";

export class ResourceConverter {

    public createResourceTableData(inputResources: ResourceFile[]): ResourceTableData {
        const uniqueCultures: Set<string> = new Set();
        const uniqueResourceNames: Set<string> = new Set();
        for (let i = 0; i < inputResources.length; i++) {
            uniqueCultures.add(inputResources[i].language);
            for (let j = 0; j < inputResources[i].dataRecords.length; j++) {
                uniqueResourceNames.add(inputResources[i].dataRecords[j].name);
            }
        }
        return new ResourceTableData(uniqueCultures, uniqueResourceNames);
    }

    public createResourceRows(inputResources: ResourceFile[], tableData: ResourceTableData): ResourceRow[] {
        const resourceRows: ResourceRow[] = [];
        const cultures = tableData.cultures;
        const resourceNames = tableData.resourceNames;

        for (let i = 0; i < cultures.length; i++) {
            const resourceFile = inputResources.find(
                (r) => r.language === cultures[i],
            );

            if (!resourceFile) {
                continue;
            }

            for (let j = 0; j < resourceNames.length; j++) {
                let record = resourceFile.dataRecords.find(
                    (r) => r.name === resourceNames[j],
                );

                if (!record) {
                    record = new ResourceFileDataRecord(resourceNames[j], "", "");
                }

                const row: ResourceRow | undefined = resourceRows.find((r) => r.name === record.name);
                const newData = new ResourceData(cultures[i], record.value);

                if (row === undefined) {
                    const newRow = new ResourceRow(record.name, record.comment ?? "", [newData]);
                    resourceRows.push(newRow);
                } else {
                    row.data.push(newData);
                }
            }
        }
        return resourceRows;
    }
}
