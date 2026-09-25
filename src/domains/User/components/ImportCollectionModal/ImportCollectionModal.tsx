import { Button, Text, Title } from '@components';
import { getBlob } from '@helpers';
import { useImportUserCollection } from '@hooks';
import { CollectionImportResult } from '@types';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { Storage } from 'aws-amplify';
import { ModalBottom } from '../../../../components/ModalBottom/ModalBottom';
import {
  ErrorItem,
  ErrorList,
  FileNameRow,
  FileNameText,
  Footer,
  HeaderRow,
  HeaderTitle,
  ResultRow,
  Section,
  TemplateLink,
} from './styles';

const TEMPLATE_CSV_CONTENT =
  'brand,bottle_name,proof,year,size,notes\n' +
  'Buffalo Trace,Buffalo Trace Bourbon,90,2022,750ml,Great everyday dram\n' +
  'Blanton\'s,Blanton\'s Original,93,,700ml,\n';

const TEMPLATE_FILENAME = 'whiskey_collection_template.csv';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ImportCollectionModal = ({ visible, onClose }: Props) => {
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<CollectionImportResult | null>(null);
  const { mutateAsync: importCollection } = useImportUserCollection();

  const reset = () => {
    setSelectedFile(null);
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const downloadTemplate = async () => {
    const path = `${FileSystem.documentDirectory}${TEMPLATE_FILENAME}`;
    await FileSystem.writeAsStringAsync(path, TEMPLATE_CSV_CONTENT, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(path, {
      mimeType: 'text/csv',
      dialogTitle: 'Save Collection Template',
    });
  };

  const pickFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true,
    });

    if (picked.canceled || !picked.assets?.[0]) return;

    const asset = picked.assets[0];
    if (asset.size && asset.size > 1024 * 1024) {
      setSelectedFile(null);
      setResult({ successCount: 0, errors: [{ row: 0, message: 'File exceeds the 1MB size limit.' }] });
      return;
    }

    setSelectedFile({ uri: asset.uri, name: asset.name });
    setResult(null);
  };

  const runImport = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const blob = await getBlob(selectedFile.uri);
      const relativeKey = `imports/${Date.now()}_${selectedFile.name}`;
      await Storage.put(relativeKey, blob, { level: 'public', contentType: 'text/csv' });
      // Amplify public level stores at public/{relativeKey} in S3
      const importResult = await importCollection({ fileKey: `public/${relativeKey}` });
      setResult(importResult);
      setSelectedFile(null);
    } catch (err: any) {
      setResult({ successCount: 0, errors: [{ row: 0, message: err?.message ?? 'Import failed. Please try again.' }] });
    } finally {
      setIsUploading(false);
    }
  };

  const hasErrors = result && result.errors.length > 0;
  const isSuccess = result && result.successCount > 0;

  return (
    <ModalBottom visible={visible} onBackButtonPress={handleClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderRow>
          <HeaderTitle>Import Collection</HeaderTitle>
        </HeaderRow>

        {!result ? (
          <>
            <Section>
              <Text size={13} color="white">
                Upload a CSV file to bulk-add bottles to your collection. Max 200 rows, 1MB.
              </Text>
              <TemplateLink onPress={downloadTemplate}>
                <Text size={13} color="primary500">Download template CSV</Text>
              </TemplateLink>
            </Section>

            <Section>
              <Button
                label={selectedFile ? 'Change file' : 'Choose CSV file'}
                variant="outlineDefault"
                icon="upload"
                iconSize={16}
                onPress={pickFile}
              />
              {selectedFile && (
                <FileNameRow>
                  <FileNameText numberOfLines={1}>{selectedFile.name}</FileNameText>
                </FileNameRow>
              )}
            </Section>

            <Footer>
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Button
                  label="Import"
                  variant="default"
                  onPress={runImport}
                  disabled={!selectedFile}
                />
              )}
            </Footer>
          </>
        ) : (
          <>
            {isSuccess && (
              <ResultRow>
                <Text size={15} color="white">
                  {`${result.successCount} bottle${result.successCount !== 1 ? 's' : ''} added to your collection.`}
                </Text>
              </ResultRow>
            )}

            {hasErrors && (
              <Section>
                <Title size={14} mt={12} mb={4}>Rows with issues</Title>
                <ErrorList>
                  {result.errors.map((err, i) => (
                    <ErrorItem key={i}>
                      <Text size={12} color="white">
                        {err.row > 0 ? `Row ${err.row}: ` : ''}{err.message}
                      </Text>
                    </ErrorItem>
                  ))}
                </ErrorList>
              </Section>
            )}

            <Footer>
              <Button label="Import another file" variant="outlineDefault" onPress={reset} />
              <Button label="Done" variant="default" onPress={handleClose} />
            </Footer>
          </>
        )}
      </ScrollView>
    </ModalBottom>
  );
};
