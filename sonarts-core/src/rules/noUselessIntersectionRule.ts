/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";
import {
  isIntersectionTypeNode,
  isNullType,
  isUndefinedType,
  isVoidType,
  isInterfaceDeclaration,
} from "../utils/navigation";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-useless-intersection",
    description: "Types without members should not be used in type intersections",
    rationale: tslint.Utils.dedent`
      An intersection type combines multiple types into one. This allows you to add together existing types to get a 
      single type that has all the features you need. However an intersection with a type without members doesn't 
      change the resulting type. This is almost certainly an error.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4335",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Remove this type without members or change this type intersection.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  protected visitNode(node: ts.Node) {
    if (isIntersectionTypeNode(node)) {
      node.types.forEach(typeNode => {
        if (isTypeWithoutMembers(this.getTypeChecker().getTypeFromTypeNode(typeNode))) {
          this.addFailureAtNode(typeNode, Rule.MESSAGE);
        }
      });
    }
    super.visitNode(node);
  }
}

function isTypeWithoutMembers(type: ts.Type) {
  const isNullLike = isNullType(type) || isUndefinedType(type) || isVoidType(type);
  const isEmptyInterface = Boolean(
    type.symbol && type.symbol.members && type.symbol.members.size === 0 && isStandaloneInterface(type.symbol),
  );
  return isNullLike || isEmptyInterface;
}

function isStandaloneInterface({ declarations }: ts.Symbol) {
  // there is no declarations for `{}`
  // otherwise check that none of declarations has a heritage clause (`extends X` or `implments X`)
  return (
    !declarations ||
    declarations.every(declaration => {
      return isInterfaceDeclaration(declaration) && (declaration.heritageClauses || []).length === 0;
    })
  );
}
