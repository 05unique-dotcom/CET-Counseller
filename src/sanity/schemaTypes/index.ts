import type { SchemaTypeDefinition } from "sanity";
import { capRoundType } from "./capRound";
import { categoryType } from "./category";
import { collegeType } from "./college";

export const schemaTypes: SchemaTypeDefinition[] = [collegeType, capRoundType, categoryType];
