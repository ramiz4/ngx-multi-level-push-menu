module.exports = {
  name: 'multi-level-push-menu-example',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/multi-level-push-menu-example',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
