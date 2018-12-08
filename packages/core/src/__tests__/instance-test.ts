/**
 * Copyright (c) The Blossom GraphQL Team.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { BlossomInstance } from '../instance';
import { BlossomRootValueAlreadyInUse } from '../errors';

import {
  IEnum,
  renderEnumToSchema,
  renderRPCDescriptionToSchema,
  renderSchema,
  RPCDescription,
} from '../schema';

jest.mock('../schema');

const MOCKS = {
  renderEnumToSchema: renderEnumToSchema as jest.Mock<
    typeof renderEnumToSchema
  >,
  renderRPCDescriptionToSchema: renderRPCDescriptionToSchema as jest.Mock<
    typeof renderRPCDescriptionToSchema
  >,
  renderSchema: renderSchema as jest.Mock<typeof renderSchema>,
};

const createInstance: () => BlossomInstance = () => {
  return new BlossomInstance();
};

describe('BlossomInstance', () => {
  describe('registerSchema', () => {
    it('should add a new schema to the schema list', () => {
      const TEST_SCHEMA_1 = 'type Test1 {}';
      const TEST_SCHEMA_2 = 'type Test2 {}';

      const instance = createInstance();

      // Add test schemas
      instance.registerSchema(TEST_SCHEMA_1);
      instance.registerSchema(TEST_SCHEMA_2);

      // This newly added schema must be on the schemas list.
      expect(instance.schemaStrings).toContain(TEST_SCHEMA_1);
      expect(instance.schemaStrings).toContain(TEST_SCHEMA_2);
    });
  });

  describe('registerEnum', () => {
    it('should add a new enum to the schema list', () => {
      const TEST_ENUM_1 = {
        name: 'TestEnum1',
        values: [{ name: 'foo' }, { name: 'bar' }],
      };

      const TEST_ENUM_2 = {
        name: 'TestEnum2',
        values: [{ name: 'test' }],
      };

      const instance = createInstance();

      instance.registerEnum(TEST_ENUM_1);
      instance.registerEnum(TEST_ENUM_2);

      expect(instance.enums).toContain(TEST_ENUM_1);
      expect(instance.enums).toContain(TEST_ENUM_2);
    });
  });

  describe('registerRootQuery', () => {
    it('should properly register the rpc description on the list of root queries', () => {
      const RPC_DESCRIPTION_1 = {
        name: 'testRootQuery1',
        type: 'TestType',
        callback: () => null,
      };

      const RPC_DESCRIPTION_2 = {
        name: 'testRootQuery2',
        type: 'TestType',
        callback: () => null,
      };

      const instance = createInstance();

      instance.registerRootQuery(RPC_DESCRIPTION_1);
      instance.registerRootQuery(RPC_DESCRIPTION_2);

      expect(instance.rootQueries).toContain(RPC_DESCRIPTION_1);
      expect(instance.rootQueries).toContain(RPC_DESCRIPTION_2);
    });

    it('should throw error when query with the same name is already registered', () => {
      const RPC_DESCRIPTION = {
        name: 'testRootQuery',
        type: 'TestType',
        callback: () => null,
      };

      const instance = createInstance();

      instance.registerRootQuery(RPC_DESCRIPTION);

      // Registering the same name again must throw an error.
      expect(() => instance.registerRootQuery(RPC_DESCRIPTION)).toThrow(
        BlossomRootValueAlreadyInUse,
      );
    });
  });

  describe('registerRootMutation', () => {
    it('should properly register the rpc description on the list of root queries', () => {
      const RPC_DESCRIPTION_1 = {
        name: 'testRootMutation1',
        type: 'TestType',
        callback: () => null,
      };

      const RPC_DESCRIPTION_2 = {
        name: 'testRootMutation2',
        type: 'TestType',
        callback: () => null,
      };

      const instance = createInstance();

      instance.registerRootMutation(RPC_DESCRIPTION_1);
      instance.registerRootMutation(RPC_DESCRIPTION_2);

      expect(instance.rootMutations).toContain(RPC_DESCRIPTION_1);
      expect(instance.rootMutations).toContain(RPC_DESCRIPTION_2);
    });

    it('should throw error when mutation with the same name is already registered', () => {
      const RPC_DESCRIPTION = {
        name: 'testRootMutation',
        type: 'TestType',
        callback: () => null,
      };

      const instance = createInstance();

      instance.registerRootMutation(RPC_DESCRIPTION);

      // Registering the same name again must throw an error.
      expect(() => instance.registerRootMutation(RPC_DESCRIPTION)).toThrow(
        BlossomRootValueAlreadyInUse,
      );
    });
  });

  describe('getRootSchema', () => {
    const TEST_ENUM: IEnum = {
      name: 'TestEnum',
      values: [{ name: 'foo' }, { name: 'bar' }],
    };
    const TEST_SCHEMA = `type Test { foo: String }`;
    const ROOT_QUERY_1: RPCDescription = {
      name: 'testQuery1',
      description: 'Test description',
      type: 'Test',
      callback: () => null,
    };
    const ROOT_QUERY_2: RPCDescription = {
      name: 'testQuery2',
      description: 'Test description',
      type: 'Test',
      callback: () => null,
    };
    const ROOT_MUTATION_1: RPCDescription = {
      name: 'testMutation1',
      description: 'Test description',
      type: 'Test',
      callback: () => null,
    };
    const ROOT_MUTATION_2: RPCDescription = {
      name: 'testMutation2',
      description: 'Test description',
      type: 'Test',
      callback: () => null,
    };

    it('should call renderEnumToSchema method when provided with enums', () => {
      MOCKS.renderEnumToSchema.mockReturnValue('enum TestEnum { foo, bar }');

      const instance = createInstance();
      instance.registerEnum(TEST_ENUM);
      instance.getRootSchema();

      expect(MOCKS.renderEnumToSchema).toBeCalledWith(TEST_ENUM);
    });

    it('should call renderRPCDescriptionToSchema as many times as root queries are registered', () => {
      MOCKS.renderRPCDescriptionToSchema
        .mockReturnValueOnce('  testQuery1: Test')
        .mockReturnValueOnce('  testQuery2: Test');

      const instance = createInstance();
      instance.registerRootQuery(ROOT_QUERY_1);
      instance.registerRootQuery(ROOT_QUERY_2);
      instance.getRootSchema();

      expect(MOCKS.renderRPCDescriptionToSchema).toHaveBeenCalledWith(
        ROOT_QUERY_1,
      );
      expect(MOCKS.renderRPCDescriptionToSchema).toHaveBeenCalledWith(
        ROOT_QUERY_2,
      );
    });

    it('should call renderRPCDescriptionToSchema as many times as root mutations are registered', () => {
      MOCKS.renderRPCDescriptionToSchema
        .mockReturnValueOnce('  testMutation1: Test')
        .mockReturnValueOnce('  testMutation2: Test');

      const instance = createInstance();
      instance.registerRootMutation(ROOT_MUTATION_1);
      instance.registerRootMutation(ROOT_MUTATION_2);
      instance.getRootSchema();

      expect(MOCKS.renderRPCDescriptionToSchema).toHaveBeenCalledWith(
        ROOT_MUTATION_1,
      );
      expect(MOCKS.renderRPCDescriptionToSchema).toHaveBeenCalledWith(
        ROOT_MUTATION_2,
      );
    });

    it('should call renderSchema with correct arguments', () => {
      // Mock results of each of the calls
      const ENUM_STRING = 'enum TestEnum { foo, bar }';
      const QUERY_STRING_1 = '  testQuery1: Test';
      const QUERY_STRING_2 = '  testQuery2: Test';
      const MUTATION_STRING_1 = '  testMutation1: Test';
      const MUTATION_STRING_2 = '  testMutation2: Test';

      MOCKS.renderEnumToSchema.mockReturnValueOnce(ENUM_STRING);
      MOCKS.renderRPCDescriptionToSchema
        .mockReturnValueOnce(QUERY_STRING_1)
        .mockReturnValueOnce(QUERY_STRING_2)
        .mockReturnValueOnce(MUTATION_STRING_1)
        .mockReturnValueOnce(MUTATION_STRING_2);

      MOCKS.renderSchema.mockReturnValue(`this doesn't matter!!`);

      const instance = createInstance();

      // Register values
      instance.registerEnum(TEST_ENUM);
      instance.registerSchema(TEST_SCHEMA);
      instance.registerRootQuery(ROOT_QUERY_1);
      instance.registerRootQuery(ROOT_QUERY_2);
      instance.registerRootMutation(ROOT_MUTATION_1);
      instance.registerRootMutation(ROOT_MUTATION_2);

      // Call the function. This should call renderSchema() in return
      instance.getRootSchema();

      // Expect how the renderSchema function should be called.
      // This is a UNIT test, not a integration one.
      expect(MOCKS.renderSchema).toBeCalledWith(
        [ENUM_STRING],
        [TEST_SCHEMA],
        [QUERY_STRING_1, QUERY_STRING_2],
        [MUTATION_STRING_1, MUTATION_STRING_2],
      );
    });

    it('should return memoized result when called more than once', () => {
      const instance = createInstance();

      instance.registerRootQuery({
        name: 'testQuery',
        type: 'Test!',
        callback: () => null,
      });
      instance.registerRootMutation({
        name: 'testMutation',
        type: 'Test!',
        callback: () => null,
      });

      expect(instance.getRootSchema({ force: false })).toBe(
        instance.getRootSchema({ force: false }),
      );
    });

    it('should return non-memoized result when called with force param to true', () => {
      const instance = createInstance();

      instance.registerRootQuery({
        name: 'testQuery',
        type: 'Test!',
        callback: () => null,
      });
      instance.registerRootMutation({
        name: 'testMutation',
        type: 'Test!',
        callback: () => null,
      });

      expect(instance.getRootSchema({ force: true })).not.toBe(
        instance.getRootSchema({ force: true }),
      );
    });
  });

  describe('getRootValue', () => {
    it('should return empty object if no root queries / mutations are included', () => {
      const instance = createInstance();

      expect(instance.getRootValue()).toEqual({});
    });

    it('should have key correctly set when root query is added', () => {
      const TEST_CALLBACK = () => null;
      const RPC_NAME = 'testQuery';

      const instance = createInstance();

      instance.registerRootQuery({
        name: RPC_NAME,
        description: 'Test description',
        type: 'Test!',
        callback: TEST_CALLBACK,
      });

      const rootValue = instance.getRootValue();

      // That must be a pass-through at this moment.
      //
      // ! If we are changing this in the future, then we need to create a unit
      // ! for the augmenter and here expect that the property is the defined
      // ! and the augmenter called.
      expect(rootValue[RPC_NAME]).toBe(TEST_CALLBACK);
    });

    it('should have key correctly set when root query is added', () => {
      const TEST_CALLBACK = () => null;
      const RPC_NAME = 'testMutation';

      const instance = createInstance();

      instance.registerRootMutation({
        name: RPC_NAME,
        description: 'Test description',
        type: 'Test!',
        callback: TEST_CALLBACK,
      });

      const rootValue = instance.getRootValue();

      // That must be a pass-through at this moment.
      //
      // ! If we are changing this in the future, then we need to create a unit
      // ! for the augmenter and here expect that the property is the defined
      // ! and the augmenter called.
      expect(rootValue[RPC_NAME]).toBe(TEST_CALLBACK);
    });

    it('should memoize results when called more than once', () => {
      const instance = createInstance();

      instance.registerRootQuery({
        name: 'testQuery',
        type: 'Test!',
        callback: () => null,
      });
      instance.registerRootMutation({
        name: 'testMutation',
        type: 'Test!',
        callback: () => null,
      });

      // Calling more than once must yield the exact same result (not only equality
      // but the same object in the heap).
      expect(instance.getRootValue({ force: false })).toBe(
        instance.getRootValue({ force: false }),
      );
    });

    it('should force a new object when force option is true', () => {
      const instance = createInstance();

      instance.registerRootQuery({
        name: 'testQuery',
        type: 'Test!',
        callback: () => null,
      });
      instance.registerRootMutation({
        name: 'testMutation',
        type: 'Test!',
        callback: () => null,
      });

      // Calling more than once must yield the exact same result (not only equality
      // but the same object in the heap).
      expect(instance.getRootValue({ force: true })).not.toBe(
        instance.getRootValue({ force: true }),
      );
    });

    // ! Order in which they are merged won't be tested at this time because
    // ! registerRootQuery / registerRootMutation are already checking that
    // ! the RPCs are not registered.
  });

  describe('hasRPC', () => {
    it('must return false when neither a query or mutation with the name has been registered', () => {
      const TEST_NAME = 'testRPC';
      const instance = createInstance();

      expect(instance.hasRPC(TEST_NAME)).toBe(false);
    });

    it('must return true when a query with the name is registered', () => {
      const TEST_NAME = 'testQuery';
      const instance = createInstance();

      instance.registerRootQuery({
        name: TEST_NAME,
        description: 'Test description',
        type: 'Test!',
        callback: () => null,
      });

      expect(instance.hasRPC(TEST_NAME)).toBe(true);
    });

    it('must return true when a mutation with the name is registered', () => {
      const TEST_NAME = 'testMutation';
      const instance = createInstance();

      instance.registerRootMutation({
        name: TEST_NAME,
        description: 'Test description',
        type: 'Test!',
        callback: () => null,
      });

      expect(instance.hasRPC(TEST_NAME)).toBe(true);
    });
  });
});
