import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from "@payloadcms/next/rsc";
import {
  CollectionField as CollectionField_cdf7e044479f899a31f804427d568b36,
  ExportPreview as ExportPreview_cdf7e044479f899a31f804427d568b36,
  ExportSaveButton as ExportSaveButton_cdf7e044479f899a31f804427d568b36,
  FieldsToExport as FieldsToExport_cdf7e044479f899a31f804427d568b36,
  FormatField as FormatField_cdf7e044479f899a31f804427d568b36,
  ImportExportProvider as ImportExportProvider_cdf7e044479f899a31f804427d568b36,
  ImportPreview as ImportPreview_cdf7e044479f899a31f804427d568b36,
  ImportSaveButton as ImportSaveButton_cdf7e044479f899a31f804427d568b36,
  Page as Page_cdf7e044479f899a31f804427d568b36,
  SelectionToUseField as SelectionToUseField_cdf7e044479f899a31f804427d568b36,
  SortBy as SortBy_cdf7e044479f899a31f804427d568b36,
  SortOrder as SortOrder_cdf7e044479f899a31f804427d568b36,
} from "@payloadcms/plugin-import-export/rsc";
import {
  LinkToDoc as LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  ReindexButton as ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
} from "@payloadcms/plugin-search/client";
import {
  AlignFeatureClient as AlignFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BlockquoteFeatureClient as BlockquoteFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BoldFeatureClient as BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ChecklistFeatureClient as ChecklistFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HeadingFeatureClient as HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HorizontalRuleFeatureClient as HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  IndentFeatureClient as IndentFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  InlineCodeFeatureClient as InlineCodeFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  InlineToolbarFeatureClient as InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ItalicFeatureClient as ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  LinkFeatureClient as LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  OrderedListFeatureClient as OrderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ParagraphFeatureClient as ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  RelationshipFeatureClient as RelationshipFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  StrikethroughFeatureClient as StrikethroughFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  SubscriptFeatureClient as SubscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  SuperscriptFeatureClient as SuperscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UnderlineFeatureClient as UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UnorderedListFeatureClient as UnorderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UploadFeatureClient as UploadFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
} from "@payloadcms/richtext-lexical/client";
import {
  LexicalDiffComponent as LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalCell as RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalField as RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
} from "@payloadcms/richtext-lexical/rsc";
import { S3ClientUploadHandler as S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24 } from "@payloadcms/storage-s3/client";
import { HomeNavLink as HomeNavLink_f04b3d5d52b82f2c98c152d722a60f81 } from "@/components/home-nav-link";

export const importMap = {
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell":
    RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalField":
    RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#LexicalDiffComponent":
    LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/client#InlineToolbarFeatureClient":
    InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#HorizontalRuleFeatureClient":
    HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UploadFeatureClient":
    UploadFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#BlockquoteFeatureClient":
    BlockquoteFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#RelationshipFeatureClient":
    RelationshipFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#LinkFeatureClient":
    LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ChecklistFeatureClient":
    ChecklistFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#OrderedListFeatureClient":
    OrderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UnorderedListFeatureClient":
    UnorderedListFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#IndentFeatureClient":
    IndentFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#AlignFeatureClient":
    AlignFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#HeadingFeatureClient":
    HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ParagraphFeatureClient":
    ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#InlineCodeFeatureClient":
    InlineCodeFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#SuperscriptFeatureClient":
    SuperscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#SubscriptFeatureClient":
    SubscriptFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#StrikethroughFeatureClient":
    StrikethroughFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#UnderlineFeatureClient":
    UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#BoldFeatureClient":
    BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ItalicFeatureClient":
    ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/plugin-import-export/rsc#FormatField":
    FormatField_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#Page":
    Page_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#SortBy":
    SortBy_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#SortOrder":
    SortOrder_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#SelectionToUseField":
    SelectionToUseField_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#FieldsToExport":
    FieldsToExport_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#CollectionField":
    CollectionField_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ExportPreview":
    ExportPreview_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ExportSaveButton":
    ExportSaveButton_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ImportPreview":
    ImportPreview_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-import-export/rsc#ImportSaveButton":
    ImportSaveButton_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/plugin-search/client#LinkToDoc":
    LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  "@payloadcms/plugin-search/client#ReindexButton":
    ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
  "@/components/home-nav-link#HomeNavLink":
    HomeNavLink_f04b3d5d52b82f2c98c152d722a60f81,
  "@payloadcms/plugin-import-export/rsc#ImportExportProvider":
    ImportExportProvider_cdf7e044479f899a31f804427d568b36,
  "@payloadcms/storage-s3/client#S3ClientUploadHandler":
    S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24,
  "@payloadcms/next/rsc#CollectionCards":
    CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
};
