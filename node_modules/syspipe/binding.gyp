{
  'targets': [
    {
      'target_name': 'syspipe',
      'include_dirs': ["<!(node -e \"require('nan')\")"],
      'sources': [
        'pipe.cc',
      ],
    }
  ]
}
