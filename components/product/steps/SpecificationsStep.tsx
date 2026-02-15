import { FormField, ValidatedInput } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Errors, FormData, SpecificationSection } from "@/types/pages/product";
import { AlertCircle, Clipboard, Plus, Table, Trash2, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { parseTableFromClipboard } from "@/utils/product/table-parser";
import { SpecificationTable } from "../SpecificationTable";

interface Specification {
  id: string;
  key: string;
  value: string;
}

interface SpecificationsStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
}

export const SpecificationsStep = React.memo(
  ({ formData, errors, updateFormData }: SpecificationsStepProps) => {
    // Sync logic: Handle both single object (legacy) and array of sections (new)
    const sections = useMemo((): SpecificationSection[] => {
      if (Array.isArray(formData.specificationTable)) {
        return formData.specificationTable;
      }

      if (formData.specificationTable && typeof formData.specificationTable === 'object') {
        // Legacy single section
        return [
          {
            title: "Technical Specifications",
            headers: formData.specificationTable.headers || ["Specification", "Value"],
            rows: formData.specificationTable.rows || [["", ""]],
          },
        ];
      }

      // Fallback: convert legacy specs array to table format
      const headers = ["Specification", "Value"];
      const rows = (formData.specifications || [])
        .filter((s) => s.key || s.value)
        .map((s) => [s.key, s.value]);

      return [
        {
          title: "Technical Specifications",
          headers,
          rows: rows.length > 0 ? rows : [["", ""]],
        },
      ];
    }, [formData.specificationTable, formData.specifications]);

    const handleUpdateSections = useCallback(
      (newSections: SpecificationSection[]) => {
        updateFormData("specificationTable", newSections);
        updateFormData("specificationDisplayFormat", "custom_table");

        // Sync first section to legacy specifications if it has 2 columns
        if (newSections.length > 0 && newSections[0].headers.length === 2) {
          const syncedSpecs = newSections[0].rows.map((row, i) => ({
            id: `spec_0_${i}`,
            key: row[0] || "",
            value: row[1] || "",
          }));
          updateFormData("specifications", syncedSpecs);
        }
      },
      [updateFormData]
    );

    const addSection = () => {
      handleUpdateSections([
        ...sections,
        {
          title: `Section ${sections.length + 1}`,
          headers: ["Attribute", "Value"],
          rows: [["", ""]],
        },
      ]);
    };

    const removeSection = (index: number) => {
      const newSections = sections.filter((_, i) => i !== index);
      handleUpdateSections(newSections.length > 0 ? newSections : []);
      if (newSections.length === 0) {
        updateFormData("specificationTable", undefined);
        updateFormData("specificationDisplayFormat", "table");
      }
    };

    const handleSectionTitleChange = (index: number, title: string) => {
      const newSections = [...sections];
      newSections[index] = { ...newSections[index], title };
      handleUpdateSections(newSections);
    };

    const handleCellChange = (
      sectionIndex: number,
      rowIndex: number,
      colIndex: number,
      value: string
    ) => {
      const newSections = [...sections];
      const newRows = [...newSections[sectionIndex].rows];
      newRows[rowIndex] = [...newRows[rowIndex]];
      newRows[rowIndex][colIndex] = value;
      newSections[sectionIndex] = { ...newSections[sectionIndex], rows: newRows };
      handleUpdateSections(newSections);
    };

    const handleHeaderChange = (
      sectionIndex: number,
      colIndex: number,
      value: string
    ) => {
      const newSections = [...sections];
      const newHeaders = [...newSections[sectionIndex].headers];
      newHeaders[colIndex] = value;
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        headers: newHeaders,
      };
      handleUpdateSections(newSections);
    };

    const addRow = (sectionIndex: number) => {
      const newSections = [...sections];
      const section = newSections[sectionIndex];
      const newRows = [...section.rows, Array(section.headers.length).fill("")];
      newSections[sectionIndex] = { ...section, rows: newRows };
      handleUpdateSections(newSections);
    };

    const removeRow = (sectionIndex: number, rowIndex: number) => {
      const newSections = [...sections];
      const section = newSections[sectionIndex];
      const newRows = section.rows.filter((_, i) => i !== rowIndex);
      newSections[sectionIndex] = {
        ...section,
        rows: newRows.length > 0 ? newRows : [Array(section.headers.length).fill("")],
      };
      handleUpdateSections(newSections);
    };

    const addColumn = (sectionIndex: number) => {
      const newSections = [...sections];
      const section = newSections[sectionIndex];
      const newHeaders = [
        ...section.headers,
        `Column ${section.headers.length + 1}`,
      ];
      const newRows = section.rows.map((row) => [...row, ""]);
      newSections[sectionIndex] = { headers: newHeaders, rows: newRows, title: section.title };
      handleUpdateSections(newSections);
    };

    const removeColumn = (sectionIndex: number, colIndex: number) => {
      const newSections = [...sections];
      const section = newSections[sectionIndex];
      if (section.headers.length <= 1) return;
      const newHeaders = section.headers.filter((_, i) => i !== colIndex);
      const newRows = section.rows.map((row) =>
        row.filter((_, i) => i !== colIndex)
      );
      newSections[sectionIndex] = { headers: newHeaders, rows: newRows, title: section.title };
      handleUpdateSections(newSections);
    };

    const handlePaste = useCallback(
      (sectionIndex: number, e: React.ClipboardEvent) => {
        const parsed = parseTableFromClipboard(e.clipboardData);
        if (parsed) {
          e.preventDefault();
          e.stopPropagation();

          const newSections = [...sections];
          const section = newSections[sectionIndex];

          const hasActualData = section.rows.some((row) =>
            row.some((cell) => cell.trim())
          );

          if (
            hasActualData &&
            section.headers.length === parsed.headers.length
          ) {
            const cleanExistingRows = section.rows.filter((row) =>
              row.some((cell) => cell.trim())
            );
            newSections[sectionIndex] = {
              ...section,
              rows: [...cleanExistingRows, ...parsed.rows],
            };
          } else {
            newSections[sectionIndex] = {
              ...parsed,
              title: section.title,
            };
          }
          handleUpdateSections(newSections);
        }
      },
      [handleUpdateSections, sections]
    );

    const clearAll = () => {
      handleUpdateSections([
        {
          title: "Technical Specifications",
          headers: ["Specification", "Value"],
          rows: [["", ""]],
        },
      ]);
      updateFormData("specificationTable", undefined);
      updateFormData("specificationDisplayFormat", "table");
    };

    const validSpecsCount = sections.reduce(
      (acc, s) => acc + s.rows.filter((r: string[]) => r.some((c: string) => c.trim())).length,
      0
    );

    return (
      <div className="space-y-8">
        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Product Specifications</h3>
            <p className="text-sm text-muted-foreground">
              Add multiple groups of specifications like "General", "Dimensions", "Performance", etc.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSection}
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
          >
            <Plus className="h-4 w-4" /> Add Group
          </Button>
        </div>

        <div className="space-y-12">
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(sectionIdx, e.target.value)}
                    className="text-lg font-bold bg-transparent border-b border-transparent hover:border-muted-foreground/30 focus:border-primary focus:outline-none w-full transition-colors"
                    placeholder="Group Title (e.g., General Information)"
                  />
                </div>
                {sections.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(sectionIdx)}
                    className="text-muted-foreground hover:text-destructive h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove Group
                  </Button>
                )}
              </div>

              <div
                className="border rounded-xl overflow-hidden group/table relative focus-within:ring-2 focus-within:ring-primary/20 outline-none bg-background shadow-sm"
                onPaste={(e) => handlePaste(sectionIdx, e)}
                tabIndex={0}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b">
                        {section.headers.map((header, i) => (
                          <th key={i} className="p-0 border-r last:border-r-0 min-w-[180px]">
                            <div className="flex items-center group/header">
                              <input
                                value={header}
                                onChange={(e) => handleHeaderChange(sectionIdx, i, e.target.value)}
                                className="w-full px-4 py-3 bg-transparent font-bold text-muted-foreground focus:outline-none focus:bg-muted/50 transition-colors"
                                placeholder={`Header ${i + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeColumn(sectionIdx, i)}
                                className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover/header:opacity-100 transition-opacity mr-2"
                                title="Remove Column"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="p-2 w-12 bg-muted/10">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addColumn(sectionIdx)}
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                            title="Add Column"
                          >
                            <Plus className="h-4 w-4 text-primary" />
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/30">
                      {section.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="group/row hover:bg-muted/5 transition-colors">
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="p-0 border-r last:border-r-0">
                              <input
                                value={cell}
                                onChange={(e) => handleCellChange(sectionIdx, rowIndex, colIndex, e.target.value)}
                                className="w-full px-4 py-3 bg-transparent focus:outline-none focus:bg-muted/20 transition-colors"
                                placeholder="..."
                              />
                            </td>
                          ))}
                          <td className="p-2 w-12 text-center bg-muted/5">
                            <button
                              type="button"
                              onClick={() => removeRow(sectionIdx, rowIndex)}
                              className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover/row:opacity-100 transition-opacity"
                              title="Remove Row"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-muted/10 border-t flex justify-between items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addRow(sectionIdx)}
                    className="text-primary hover:bg-primary/10 h-8"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Row
                  </Button>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                    <Clipboard className="h-3 w-3" />
                    Paste Excel/Google Sheets Table Here
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {validSpecsCount > 0 && (
          <div className="pt-8 space-y-6">
            <Separator />
            <div className="bg-muted/20 border rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Table className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Preview & Format</h3>
                </div>
                <div className="flex items-center gap-2 p-1 bg-background rounded-lg border shadow-sm">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      formData.specificationDisplayFormat === "bullet"
                        ? "ghost"
                        : "secondary"
                    }
                    onClick={() => updateFormData("specificationDisplayFormat", "table")}
                    className="h-8 text-xs font-bold"
                  >
                    Table
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      formData.specificationDisplayFormat === "bullet"
                        ? "secondary"
                        : "ghost"
                    }
                    onClick={() => updateFormData("specificationDisplayFormat", "bullet")}
                    className="h-8 text-xs font-bold"
                  >
                    Bullets
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border bg-background p-4 shadow-sm">
                {formData.specificationDisplayFormat === "bullet" ? (
                  <div className="space-y-6">
                    {sections.map((section, idx) => (
                      <div key={idx} className="space-y-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{section.title}</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {section.rows
                            .filter((r) => r[0] && r[1])
                            .map((row, i) => (
                              <li key={i} className="flex text-sm">
                                <span className="font-bold text-primary mr-2">•</span>
                                <span>
                                  <span className="font-semibold">{row[0]}:</span>{" "}
                                  <span className="text-muted-foreground">{row[1]}</span>
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {sections.map((section, idx) => (
                      <div key={idx} className="space-y-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{section.title}</h4>
                        <SpecificationTable data={section} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-muted-foreground hover:text-destructive h-8"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Reset All Specifications
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SpecificationsStep.displayName = "SpecificationsStep";
